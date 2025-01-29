import { fetch } from "undici";
import { getService } from "@/lib/docker";
import path from "node:path";
import { createTRPCRouter } from "@/trpc/init";
import { baseProcedure } from "@/trpc/init";
import { z } from "zod";

export type GetMoviesResponse = Movie[];

interface Movie {
  id: number;
  title: string;
  sortTitle: string;
  releaseDate: string;
  sizeOnDisk: number;
  year: number;
  titleSlug: string;
}

export const radarrRouter = createTRPCRouter({
  getMovies: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id } }) => {
      const RADARR_ACCESS_TOKEN =
        process.env[`WIDGET_${id.toUpperCase()}_RADARR_ACCESS_TOKEN`];
      if (!RADARR_ACCESS_TOKEN) {
        throw new Error("Radarr access token not found");
      }

      const service = await getService(id, "radarr");
      if (!service) {
        throw new Error("Service not found");
      }

      if (!service.url) {
        throw new Error("Service URL not found");
      }

      // The service URL may include a base path, so we need to merge the base path
      // with the API endpoint.
      const url = new URL(service.url);
      url.pathname = path.join(url.pathname, "/api/v3/movie");

      const response = await fetch(url, {
        headers: {
          "X-Api-Key": RADARR_ACCESS_TOKEN,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = (await response.json()) as GetMoviesResponse;

      data.sort((a, b) => {
        return a.sortTitle.localeCompare(b.sortTitle);
      });

      return data.map(
        (movie): Movie => ({
          id: movie.id,
          title: movie.title,
          sortTitle: movie.sortTitle,
          titleSlug: movie.titleSlug,
          year: movie.year,
          releaseDate: movie.releaseDate,
          sizeOnDisk: movie.sizeOnDisk,
        })
      );
    }),
});
