import type { ContainerService } from "@/types/service";
import { ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ServiceCardDrawer } from "./service-card-drawer";
import { Widgets } from "./widgets";

export function ServiceCard({ service }: { service: ContainerService }) {
  return (
    <Card className="bg-linear-to-br from-gray-900 to-gray-800 motion-preset-slide-down">
      <CardHeader>
        <CardTitle className="flex flex-row justify-between space-x-4 items-center">
          <div>{service.name}</div>
          <div className="flex flex-row items-center space-x-2">
            {service.tags
              ? service.tags.map((tag) => (
                  <Badge variant="secondary" key={tag}>
                    {tag}
                  </Badge>
                ))
              : null}
            {service.url ? (
              <a
                href={service.url}
                title={`Open ${service.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className=""
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <Widgets service={service} />
        </div>
        <ServiceCardDrawer service={service} />
      </CardContent>
    </Card>
  );
}
