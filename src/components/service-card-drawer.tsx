"use client";

import type { ContainerService } from "@/types/service";
import { useStore } from "@/lib/store";
import { DebugData } from "./debug-data";

type Props = {
  service: ContainerService;
};

export function ServiceCardDrawer({ service }: Props) {
  const dev = useStore((state) => state.context.dev);
  if (!dev) return null;

  return <DebugData data={service} />;
}
