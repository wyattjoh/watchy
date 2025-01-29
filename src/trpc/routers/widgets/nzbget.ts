import { getService } from "@/lib/docker";
import { baseProcedure } from "@/trpc/init";
import { createTRPCRouter } from "@/trpc/init";
import path from "node:path";
import { z } from "zod";

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

export const nzbgetRouter = createTRPCRouter({
  getStatus: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id } }) => {
      const NZBGET_RESTRICTED_USERNAME =
        process.env[
          `WIDGET_${id
            .toUpperCase()
            .replace(/-/g, "_")}_NZBGET_RESTRICTED_USERNAME`
        ];
      if (!NZBGET_RESTRICTED_USERNAME) {
        throw new Error("NZBGet restricted username not found");
      }

      const NZBGET_RESTRICTED_PASSWORD =
        process.env[
          `WIDGET_${id
            .toUpperCase()
            .replace(/-/g, "_")}_NZBGET_RESTRICTED_PASSWORD`
        ];
      if (!NZBGET_RESTRICTED_PASSWORD) {
        throw new Error("NZBGet restricted password not found");
      }

      const service = await getService(id, "nzbget");
      if (!service) {
        throw new Error("Service not found");
      }

      if (!service.url) {
        throw new Error("Service URL not found");
      }

      const url = new URL(service.url);
      url.pathname = path.join(url.pathname, "/jsonrpc/status");

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${btoa(
            `${NZBGET_RESTRICTED_USERNAME}:${NZBGET_RESTRICTED_PASSWORD}`
          )}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch NZBGet status");
      }

      return response.json() as Promise<NZBGetStatusResponse>;
    }),
  getListGroups: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id } }) => {
      const NZBGET_RESTRICTED_USERNAME =
        process.env[
          `WIDGET_${id
            .toUpperCase()
            .replace(/-/g, "_")}_NZBGET_RESTRICTED_USERNAME`
        ];
      if (!NZBGET_RESTRICTED_USERNAME) {
        throw new Error("NZBGet restricted username not found");
      }

      const NZBGET_RESTRICTED_PASSWORD =
        process.env[
          `WIDGET_${id
            .toUpperCase()
            .replace(/-/g, "_")}_NZBGET_RESTRICTED_PASSWORD`
        ];
      if (!NZBGET_RESTRICTED_PASSWORD) {
        throw new Error("NZBGet restricted password not found");
      }

      const service = await getService(id, "nzbget");
      if (!service) {
        throw new Error("Service not found");
      }

      if (!service.url) {
        throw new Error("Service URL not found");
      }

      const url = new URL(service.url);
      url.pathname = path.join(url.pathname, "/jsonrpc/listgroups");

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${btoa(
            `${NZBGET_RESTRICTED_USERNAME}:${NZBGET_RESTRICTED_PASSWORD}`
          )}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch NZBGet list groups");
      }

      return response.json() as Promise<NZBGetListGroupsResponse>;
    }),
});
