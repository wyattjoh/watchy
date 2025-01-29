import { getService } from "@/lib/docker";
import path from "node:path";
import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

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

export const beszelRouter = createTRPCRouter({
  getStatus: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id } }) => {
      const BESZEL_ACCESS_TOKEN =
        process.env[
          `WIDGET_${id.toUpperCase().replace(/-/g, "_")}_BESZEL_ACCESS_TOKEN`
        ];
      if (!BESZEL_ACCESS_TOKEN) {
        throw new Error("Beszel access token not found");
      }

      const service = await getService(id, "beszel-hub");
      if (!service) {
        throw new Error("Service not found");
      }

      if (!service.url) {
        throw new Error("Service URL not found");
      }

      // The service URL may include a base path, so we need to merge the base path
      // with the API endpoint.
      const url = new URL(service.url);
      url.pathname = path.join(
        url.pathname,
        "/api/collections/systems/records"
      );

      const response = await fetch(url, {
        headers: {
          Authorization: BESZEL_ACCESS_TOKEN,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }

      return (await response.json()) as BeszelResponse;
    }),
});
