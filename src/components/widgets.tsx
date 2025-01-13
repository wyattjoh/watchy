import type { ContainerService } from "@/types/service";
import { HealthWidget } from "./widgets/health-widget";
import { BeszelHubWidget } from "./widgets/beszel-hub-widget";
import { PlexWidget } from "./widgets/plex-widget";
import { SonarrWidget } from "./widgets/sonarr-widget";
import { RadarrWidget } from "./widgets/radarr-widget";

type Props = {
  service: ContainerService;
};

export function Widgets({ service }: Props) {
  const widgets = [
    // Always include the health widget
    <HealthWidget key="health" service={service} />,
  ];

  if (service.status === "running") {
    if (service.type === "plex") {
      widgets.push(<PlexWidget key="plex" service={service} />);
    } else if (service.type === "sonarr") {
      widgets.push(<SonarrWidget key="sonarr" service={service} />);
    } else if (service.type === "beszel-hub") {
      widgets.push(<BeszelHubWidget key="beszel-hub" service={service} />);
    } else if (service.type === "radarr") {
      widgets.push(<RadarrWidget key="radarr" service={service} />);
    }
  }

  return widgets;
}
