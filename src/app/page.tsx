import RefreshButton from "@/components/refresh-button";
import { Dashboard } from "@/components/dashboard";
import { ConfigureContainerButton } from "@/components/configure-container-button";
import { DevToggle } from "@/components/dev-toggle";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="w-full mx-auto p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="hidden md:flex justify-end items-center gap-2">
          <DevToggle />
          <RefreshButton />
          <ConfigureContainerButton />
        </div>
        <Suspense>
          <DashboardWrapper />
        </Suspense>
        <div className="md:hidden flex flex-col justify-end items-end gap-6">
          <div className="flex gap-2">
            <RefreshButton />
            <ConfigureContainerButton />
          </div>
          <DevToggle />
        </div>
      </div>
    </div>
  );
}

async function DashboardWrapper() {
  await trpc.containers.listServices.prefetch();

  return (
    <HydrateClient>
      <Suspense>
        <Dashboard />
      </Suspense>
    </HydrateClient>
  );
}
