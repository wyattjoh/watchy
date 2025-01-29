import { createTRPCRouter } from "@/trpc/init";

import { beszelRouter } from "./beszel";
import { nzbgetRouter } from "./nzbget";
import { plexRouter } from "./plex";
import { radarrRouter } from "./radarr";
import { sonarrRouter } from "./sonarr";

export const widgetsRouter = createTRPCRouter({
  beszel: beszelRouter,
  plex: plexRouter,
  nzbget: nzbgetRouter,
  radarr: radarrRouter,
  sonarr: sonarrRouter,
});
