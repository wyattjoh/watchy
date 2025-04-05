import "server-only";

import { fetch, Agent } from "undici";
import type { ContainerInfo, ContainerService } from "@/types/service";
import { parseLabels } from "./labels";

const dispatcher = new Agent({
  connect: {
    socketPath: "/var/run/docker.sock",
  },
});

async function listContainerServices(container: Container) {
  const labels = parseLabels(container.Labels);
  if (!labels.enable) {
    return [];
  }

  const services: ContainerService[] = [];
  for (const [id, service] of Object.entries(labels.service)) {
    if (!service.name) {
      console.warn("Skipping service", id, "due to missing name");
      return [];
    }

    const info = await inspectContainer(container.Id);

    services.push({
      id: service.id,
      containerID: container.Id,
      type: service.type,
      name: service.name,
      url: service.url,
      status: info.State?.Status,
      health: info.State?.Health?.Status,
      statusText: container.Status,
      createdAt: info.Created,
      tags: service.tags,
      healthLogs: info.State?.Health?.Log.map((log) => ({
        start: log.Start,
        end: log.End,
        exitCode: log.ExitCode,
        output: log.Output,
      })),
    });
  }

  return services;
}

async function listContainersServices(
  containers: Container[]
): Promise<ContainerService[]> {
  const services: ContainerService[] = [];
  for (const container of containers) {
    const service = await listContainerServices(container);
    services.push(...service);
  }

  return services.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}

export type Container = {
  Id: string;
  Image: string;
  Created: number;
  Names: string[];
  Status: string;
  Labels: Record<string, string>;
  [key: string]: unknown;
};

async function inspectContainer(id: string) {
  const url = new URL(`http://localhost/containers/${id}/json`);
  const response = await fetch(url, {
    dispatcher,
  });

  return response.json() as Promise<ContainerInfo>;
}

export async function listAllContainers() {
  const url = new URL("http://localhost/containers/json");
  url.searchParams.set("all", "true");

  const response = await fetch(url, {
    dispatcher,
  });

  return response.json() as Promise<Container[]>;
}

async function listContainers() {
  const url = new URL("http://localhost/containers/json");
  url.searchParams.set("all", "true");
  url.searchParams.set(
    "filters",
    JSON.stringify({ label: ["ca.wyattjoh.watchy.enable=true"] })
  );

  const response = await fetch(url, {
    dispatcher,
  });

  return response.json() as Promise<Container[]>;
}

async function getContainer(id: string, type: string) {
  const url = new URL("http://localhost/containers/json");
  url.searchParams.set(
    "filters",
    JSON.stringify({
      label: [
        "ca.wyattjoh.watchy.enable=true",
        `ca.wyattjoh.watchy.service.${id}.type=${type}`,
      ],
    })
  );
  const response = await fetch(url, {
    dispatcher,
  });

  return response.json() as Promise<Container[]>;
}

export async function listServices() {
  try {
    const containers = await listContainers();
    const services = await listContainersServices(containers);
    return services;
  } catch {
    return [];
  }
}

export async function getService(
  id: string,
  type: string
): Promise<ContainerService | null> {
  const containers = await getContainer(id, type);
  if (containers.length === 0) {
    console.warn("No containers found for service", id);
    return null;
  }

  if (containers.length > 1) {
    console.warn("Multiple containers found for service", id);
    return null;
  }

  const container = containers[0];
  if (!container) {
    console.warn("No container found for service", id);
    return null;
  }

  const services = await listContainerServices(container);
  if (services.length === 0) {
    console.warn("No services found for container", container.Id);
    return null;
  }

  const service = services.find((service) => service.id === id);
  if (!service) {
    console.warn("Service not found for container", container.Id);
    return null;
  }

  return service;
}

export async function getEventsStream(
  signal: AbortSignal | undefined
): Promise<ReadableStream<Uint8Array>> {
  const request = new URL("http://localhost/events");
  request.searchParams.set(
    "filters",
    JSON.stringify({
      type: ["container"],
      event: [
        "create",
        "destroy",
        "die",
        "start",
        "kill",
        "restart",
        "update",
        "stop",
        "pause",
        "unpause",
        "health_status",
      ],
      label: ["ca.wyattjoh.watchy.enable=true"],
    })
  );

  const response = await fetch(request, {
    dispatcher,
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error("Failed to fetch events");
  }

  return response.body as ReadableStream<Uint8Array>;
}
