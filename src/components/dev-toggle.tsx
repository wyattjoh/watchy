"use client";

import { store, useStore } from "@/lib/store";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function DevToggle({ className }: Props) {
  const dev = useStore((state) => state.context.dev);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch
        id="dev-mode"
        checked={dev}
        onClick={() => { store.send({ type: "toggleDev" }); }}
      />
      <Label htmlFor="dev-mode">Developer Mode</Label>
    </div>
  );
}
