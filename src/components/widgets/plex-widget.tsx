"use client";

import { TvMinimalPlay } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import type { PlexWidgetData } from "../../app/api/widgets/[id]/plex/route";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { ContainerService } from "@/types/service";
import { Widget } from "../widget";
import { DebugData } from "../debug-data";
import { WidgetButton, WidgetButtonFallback } from "../widget-button";

type Props = {
  service: ContainerService;
};

export function PlexWidget({ service }: Props) {
  const { data } = useQuery({
    queryKey: ["widgets", "plex", service.id],
    queryFn: async (): Promise<PlexWidgetData> => {
      const response = await fetch(`/api/widgets/${service.id}/plex`);
      if (!response.ok) {
        throw new Error("Failed to fetch Plex sessions");
      }

      return response.json() as Promise<PlexWidgetData>;
    },
    refetchInterval: 10000,
  });

  return (
    <Widget
      title="Currently Watching"
      icon={<TvMinimalPlay className="w-4 h-4" />}
    >
      {data ? (
        <Dialog>
          <DialogTrigger asChild>
            <WidgetButton>
              {data.MediaContainer.size === 0
                ? "No playback sessions"
                : data.MediaContainer.size === 1
                ? "1 playback session"
                : `${data.MediaContainer.size.toString()} playback sessions`}
            </WidgetButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Active Plex Sessions</DialogTitle>
              <DialogDescription>
                All active Plex sessions for this container.
              </DialogDescription>
            </DialogHeader>
            {data.MediaContainer.size > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.MediaContainer.Metadata?.map((session) => (
                    <TableRow key={session.Session.id}>
                      <TableCell>
                        {session.grandparentTitle
                          ? `${session.grandparentTitle} - ${session.title}`
                          : session.title}
                      </TableCell>
                      <TableCell className="flex items-center space-x-2">
                        <img
                          src={session.User.thumb}
                          alt={session.User.title}
                          className="w-4 h-4 rounded-full"
                        />
                        <span>{session.User.title}</span>
                      </TableCell>
                      <TableCell>{session.Player.title}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex justify-center items-center h-full p-4">
                <span className="text-gray-400">No active sessions</span>
              </div>
            )}
            <DebugData data={data} />
          </DialogContent>
        </Dialog>
      ) : (
        <WidgetButtonFallback />
      )}
    </Widget>
  );
}
