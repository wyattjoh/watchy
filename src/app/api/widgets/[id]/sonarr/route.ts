import { fetch } from "undici";
import { getService } from "@/lib/docker";
import path from "node:path";

export const dynamic = "force-dynamic";

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

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const SONARR_ACCESS_TOKEN =
    process.env[`WIDGET_${id.toUpperCase()}_SONARR_ACCESS_TOKEN`];
  if (!SONARR_ACCESS_TOKEN) {
    return Response.json(
      { error: "Sonarr access token not found" },
      { status: 404 }
    );
  }

  const service = await getService(id, "sonarr");
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  if (!service.url) {
    return Response.json({ error: "Service URL not found" }, { status: 404 });
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
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }

  const data = (await response.json()) as GetSeriesResponse;

  data.sort((a, b) => {
    return a.sortTitle.localeCompare(b.sortTitle);
  });

  return Response.json(
    data.map(
      (series): Series => ({
        id: series.id,
        title: series.title,
        sortTitle: series.sortTitle,
        titleSlug: series.titleSlug,
        statistics: series.statistics,
      })
    )
  );
}
