import { fetch } from "undici";
import { getService } from "@/lib/docker";
import path from "node:path";
import { createTRPCRouter } from "@/trpc/init";
import { baseProcedure } from "@/trpc/init";
import { z } from "zod";

export type GetSeriesResponse = Series[];

export interface Statistics {
  episodeFileCount: number;
  episodeCount: number;
  totalEpisodeCount: number;
  sizeOnDisk: number;
  releaseGroups: string[];
  percentOfEpisodes: number;
  previousAiring?: string;
  nextAiring?: string;
}

export interface Series {
  title: string;
  sortTitle: string;
  titleSlug: string;
  id: number;
  statistics: Statistics;
}

export const sonarrRouter = createTRPCRouter({
  getSeries: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id } }) => {
      const SONARR_ACCESS_TOKEN =
        process.env[`WIDGET_${id.toUpperCase()}_SONARR_ACCESS_TOKEN`];
      if (!SONARR_ACCESS_TOKEN) {
        throw new Error("Sonarr access token not found");
      }

      const service = await getService(id, "sonarr");
      if (!service) {
        throw new Error("Service not found");
      }

      if (!service.url) {
        throw new Error("Service URL not found");
      }

      // The service URL may include a base path, so we need to merge the base path
      // with the API endpoint.
      const url = new URL(service.url);
      url.pathname = path.join(url.pathname, "/api/v3/series");

      const response = await fetch(url, {
        headers: {
          "X-Api-Key": SONARR_ACCESS_TOKEN,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = (await response.json()) as GetSeriesResponse;

      data.sort((a, b) => {
        return a.sortTitle.localeCompare(b.sortTitle);
      });

      return data.map(
        (series): Series => ({
          id: series.id,
          title: series.title,
          sortTitle: series.sortTitle,
          titleSlug: series.titleSlug,
          statistics: series.statistics,
        })
      );
    }),
});
