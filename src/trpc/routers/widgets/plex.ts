import { fetch } from "undici";
import { getService } from "@/lib/docker";
import path from "node:path";
import { createTRPCRouter } from "@/trpc/init";
import { baseProcedure } from "@/trpc/init";
import { z } from "zod";

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

export const plexRouter = createTRPCRouter({
  getSessions: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id } }) => {
      const PLEX_ACCESS_TOKEN =
        process.env[`WIDGET_${id.toUpperCase()}_PLEX_ACCESS_TOKEN`];
      if (!PLEX_ACCESS_TOKEN) {
        throw new Error("Plex access token not found");
      }

      const service = await getService(id, "plex");
      if (!service) {
        throw new Error("Service not found");
      }

      if (!service.url) {
        throw new Error("Service URL not found");
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
        throw new Error("Failed to fetch sessions");
      }

      return (await response.json()) as PlexWidgetData;
    }),
});
