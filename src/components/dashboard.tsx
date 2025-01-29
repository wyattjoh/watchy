"use client";

import { trpc } from "@/trpc/client";
import { ServiceCard } from "./service-card";

export function Dashboard() {
  const [services, { refetch }] = trpc.services.useSuspenseQuery();
  trpc.events.useSubscription(undefined, {
    onData() {
      void refetch();
    },
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {services.length > 0 ? (
        services.map((service) => (
          <ServiceCard key={service.containerID} service={service} />
        ))
      ) : (
        <div className="text-center text-gray-400">No services configured</div>
      )}
    </div>
  );
}
