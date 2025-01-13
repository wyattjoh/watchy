import { getService } from "@/lib/docker";
import path from "node:path";

export interface NZBGetWidgetResponse {
  status: NZBGetStatusResponse;
  listGroups: NZBGetListGroupsResponse;
}

export interface NZBGetListGroupsResponse {
  version: string;
  result: NZBGetListGroup[];
}

export interface NZBGetListGroup {
  Status: string;
  NZBName: string;
}

export interface NZBGetStatusResponse {
  version: string;
  result: StatusResult;
}

interface StatusResult {
  DownloadRate: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const NZBGET_RESTRICTED_USERNAME =
    process.env[
      `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_NZBGET_RESTRICTED_USERNAME`
    ];
  if (!NZBGET_RESTRICTED_USERNAME) {
    return Response.json(
      {
        error: "NZBGet restricted username not found",
        token: `WIDGET_${id
          .toUpperCase()
          .replace(/-/g, "_")}_NZBGET_RESTRICTED_USERNAME`,
      },
      { status: 404 }
    );
  }

  const NZBGET_RESTRICTED_PASSWORD =
    process.env[
      `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_NZBGET_RESTRICTED_PASSWORD`
    ];
  if (!NZBGET_RESTRICTED_PASSWORD) {
    return Response.json(
      {
        error: "NZBGet restricted password not found",
        token: `WIDGET_${id
          .toUpperCase()
          .replace(/-/g, "_")}_NZBGET_RESTRICTED_PASSWORD`,
      },
      { status: 404 }
    );
  }

  const service = await getService(id, "nzbget");
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  if (!service.url) {
    return Response.json({ error: "Service URL not found" }, { status: 404 });
  }

  let url = new URL(service.url);
  url.pathname = path.join(url.pathname, "/jsonrpc/status");

  let response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(
        `${NZBGET_RESTRICTED_USERNAME}:${NZBGET_RESTRICTED_PASSWORD}`
      )}`,
    },
  });

  if (!response.ok) {
    return Response.json(
      { error: "Failed to fetch NZBGet status" },
      { status: 500 }
    );
  }

  const status = (await response.json()) as NZBGetStatusResponse;

  url = new URL(service.url);
  url.pathname = path.join(url.pathname, "/jsonrpc/listgroups");

  response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(
        `${NZBGET_RESTRICTED_USERNAME}:${NZBGET_RESTRICTED_PASSWORD}`
      )}`,
    },
  });

  if (!response.ok) {
    return Response.json(
      { error: "Failed to fetch NZBGet list groups" },
      { status: 500 }
    );
  }

  const listGroups = (await response.json()) as NZBGetListGroupsResponse;

  return Response.json({ status, listGroups });
}
