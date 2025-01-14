"use client";

import { cn } from "@/lib/utils";
import type { ContainerService } from "@/types/service";
import { Activity } from "lucide-react";
import { Widget } from "../widget";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { WidgetButton } from "../widget-button";
import { Badge } from "../ui/badge";

const statusConfig = {
  healthy: {
    color: "bg-emerald-900 hover:bg-emerald-900/50",
    textColor: "text-emerald-50",
  },
  unhealthy: {
    color: "bg-rose-900 hover:bg-rose-900/50",
    textColor: "text-rose-50",
  },
  starting: {
    color: "bg-amber-900 hover:bg-amber-900/50",
    textColor: "text-amber-50",
  },
  none: {
    color: "bg-gray-900 hover:bg-gray-900/50",
    textColor: "text-gray-50",
  },
};

type Props = {
  service: ContainerService;
};

export function HealthWidget({ service }: Props) {
  const dev = useStore((state) => state.context.dev);

  return (
    <Widget title="Status" icon={<Activity className="w-4 h-4" />}>
      <Dialog>
        <DialogTrigger asChild>
          <WidgetButton
            className={cn(
              "flex justify-start text-xs",
              service.health
                ? statusConfig[service.health].color
                : statusConfig.none.color,
              service.health
                ? statusConfig[service.health].textColor
                : statusConfig.none.textColor
            )}
          >
            {service.statusText}
          </WidgetButton>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Health Events</DialogTitle>
            <DialogDescription>
              Recent health events for this container.
            </DialogDescription>
          </DialogHeader>
          {service.healthLogs ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>Exit Code</TableHead>
                  <TableHead>Output</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {service.healthLogs.map((log, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(log.start).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.exitCode}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.output ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              View Output
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Output</DialogTitle>
                            </DialogHeader>
                            <pre className="text-xs text-gray-400 mt-4 p-4 bg-gray-900 rounded-md overflow-x-auto">
                              {log.output}
                            </pre>
                          </DialogContent>
                        </Dialog>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex justify-center items-center h-full p-4">
              <span className="text-gray-400">No recent health events</span>
            </div>
          )}
          {dev ? (
            <pre className="text-xs text-gray-400 mt-4 p-4 bg-gray-900 rounded-md overflow-x-auto">
              {JSON.stringify(service, null, 2)}
            </pre>
          ) : null}
        </DialogContent>
      </Dialog>
    </Widget>
  );
}
