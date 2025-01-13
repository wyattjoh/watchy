import { getService } from "@/lib/docker";
import path from "node:path";

export const dynamic = "force-dynamic";

export interface BeszelResponse {
  items: ItemsItem[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ItemsItem {
  collectionId: string;
  collectionName: string;
  created: string;
  host: string;
  id: string;
  info: Info;
  name: string;
  port: string;
  status: "up" | "down" | "paused" | "pending";
  updated: string;
  users: string[];
}

interface Info {
  b: number;
  c: number;
  cpu: number;
  dp: number;
  h: string;
  k: string;
  m: string;
  mp: number;
  t: number;
  u: number;
  v: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const BESZEL_ACCESS_TOKEN =
    process.env[
      `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_BESZEL_ACCESS_TOKEN`
    ];
  if (!BESZEL_ACCESS_TOKEN) {
    return Response.json(
      {
        error: "Beszel access token not found",
        token: `WIDGET_${id
          .toUpperCase()
          .replace(/-/g, "_")}_BESZEL_ACCESS_TOKEN`,
      },
      { status: 404 }
    );
  }

  const service = await getService(id, "beszel-hub");
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  if (!service.url) {
    return Response.json({ error: "Service URL not found" }, { status: 404 });
  }

  // The service URL may include a base path, so we need to merge the base path
  // with the API endpoint.
  const url = new URL(service.url);
  url.pathname = path.join(url.pathname, "/api/collections/systems/records");

  const response = await fetch(url, {
    headers: {
      Authorization: BESZEL_ACCESS_TOKEN,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    return Response.json({ error: "Failed to fetch status" }, { status: 500 });
  }

  return Response.json(await response.json());
}
