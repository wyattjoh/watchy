import { fetch } from "undici";
import { getService } from "@/lib/docker";
import path from "node:path";

export const dynamic = "force-dynamic";

export interface PlexWidgetData {
  MediaContainer: MediaContainer;
}

interface MediaContainer {
  size: number;
  Metadata?: MetadataItem[];
}

interface MetadataItem {
  grandparentTitle: string;
  title: string;
  User: User;
  Player: Player;
  Session: Session;
}

interface User {
  thumb: string;
  title: string;
}

interface Player {
  title: string;
}

interface Session {
  id: string;
  bandwidth: number;
  location: string;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const PLEX_ACCESS_TOKEN =
    process.env[`WIDGET_${id.toUpperCase()}_PLEX_ACCESS_TOKEN`];
  if (!PLEX_ACCESS_TOKEN) {
    return Response.json(
      { error: "Plex access token not found" },
      { status: 404 }
    );
  }

  const service = await getService(id, "plex");
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  if (!service.url) {
    return Response.json({ error: "Service URL not found" }, { status: 404 });
  }

  // The service URL may include a base path, so we need to merge the base path
  // with the API endpoint.
  const url = new URL(service.url);
  url.pathname = path.join(url.pathname, "/status/sessions");

  const response = await fetch(url, {
    headers: {
      "X-Plex-Token": PLEX_ACCESS_TOKEN,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }

  return Response.json(await response.json());
}
