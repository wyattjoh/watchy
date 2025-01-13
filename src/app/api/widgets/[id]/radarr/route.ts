import { fetch } from "undici";
import { getService } from "@/lib/docker";
import path from "node:path";

export const dynamic = "force-dynamic";

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

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const RADARR_ACCESS_TOKEN =
    process.env[`WIDGET_${id.toUpperCase()}_RADARR_ACCESS_TOKEN`];
  if (!RADARR_ACCESS_TOKEN) {
    return Response.json(
      { error: "Radarr access token not found" },
      { status: 404 }
    );
  }

  const service = await getService(id, "radarr");
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  if (!service.url) {
    return Response.json({ error: "Service URL not found" }, { status: 404 });
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
    return Response.json({ error: "Failed to fetch movies" }, { status: 500 });
  }

  const data = (await response.json()) as GetMoviesResponse;

  data.sort((a, b) => {
    return a.sortTitle.localeCompare(b.sortTitle);
  });

  return Response.json(
    data.map(
      (movie): Movie => ({
        id: movie.id,
        title: movie.title,
        sortTitle: movie.sortTitle,
        titleSlug: movie.titleSlug,
        year: movie.year,
        releaseDate: movie.releaseDate,
        sizeOnDisk: movie.sizeOnDisk,
      })
    )
  );
}
