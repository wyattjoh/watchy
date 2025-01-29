import { fetch, Agent } from "undici";
import type { ContainerInfo, ContainerService } from "@/types/service";
import { parseLabels } from "./labels";

const dispatcher = new Agent({
  connect: {
    socketPath: "/var/run/docker.sock",
  },
});

async function getContainerServices(container: Container) {
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

async function getContainersServices(
  containers: Container[]
): Promise<ContainerService[]> {
  const services: ContainerService[] = [];
  for (const container of containers) {
    const service = await getContainerServices(container);
    services.push(...service);
  }

  return services.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

type Container = {
  Id: string;
  Status: string;
  Labels: Record<string, string>;
};

async function inspectContainer(id: string) {
  const url = new URL(`http://localhost/containers/${id}/json`);
  const response = await fetch(url, {
    dispatcher,
  });

  return response.json() as Promise<ContainerInfo>;
}

async function getContainers() {
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

export async function getServices() {
  try {
    const containers = await getContainers();
    const services = await getContainersServices(containers);
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

  const services = await getContainerServices(container);
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

export async function getEvents(
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
