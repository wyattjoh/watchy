import type { ContainerService } from "@/types/service";
import { ServiceCard } from "./service-card";

export async function Dashboard(props: {
  services: Promise<ContainerService[]>;
}) {
  const services = await props.services;

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
