"use client";

import { trpc } from "@/trpc/client";
import { ServiceCard } from "./service-card";
import { AllContainers, AllContainersSkeleton } from "./all-containers";
import { Suspense } from "react";

export function Dashboard() {
  const [services, { refetch: refetchServices }] =
    trpc.containers.listServices.useSuspenseQuery();

  trpc.events.useSubscription(undefined, {
    onData() {
      void refetchServices();
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-gray-600">Services</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.length > 0 ? (
            services.map((service) => (
              <ServiceCard key={service.containerID} service={service} />
            ))
          ) : (
            <div className="text-center text-gray-400">
              No services configured
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-gray-600">All Containers</h2>
        <Suspense fallback={<AllContainersSkeleton />}>
          <AllContainers />
        </Suspense>
      </div>
    </div>
  );
}
