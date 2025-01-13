import { getServices } from "@/lib/docker";
import { Suspense } from "react";
import RefreshButton from "@/components/refresh-button";
import { Dashboard } from "@/components/dashboard";
import { ConfigureContainerButton } from "@/components/configure-container-button";
import { DevToggle } from "@/components/dev-toggle";

export default function Home() {
  const services = getServices();

  return (
    <div className="w-full mx-auto p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="hidden md:flex justify-end items-center gap-2">
          <DevToggle />
          <RefreshButton />
          <ConfigureContainerButton />
        </div>
        <Suspense>
          <Dashboard services={services} />
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
