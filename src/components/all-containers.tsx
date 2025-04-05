import { formatName } from "@/lib/format-name";
import { TimeAgo } from "./time-ago";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

export function AllContainers() {
  const [allContainers, { refetch: refetchContainers }] =
    trpc.containers.listAll.useSuspenseQuery();

  trpc.events.useSubscription(undefined, {
    onData() {
      void refetchContainers();
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allContainers.map((container) => (
          <TableRow key={container.Id}>
            <TableCell className="font-mono">
              {container.Id.slice(0, 12)}
            </TableCell>
            <TableCell>{formatName(container)}</TableCell>
            <TableCell>{container.Image}</TableCell>
            <TableCell>
              <TimeAgo date={new Date(container.Created * 1000)} />
            </TableCell>
            <TableCell>{container.Status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AllContainersSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <TableRow key={index}>
            <TableCell
              colSpan={5}
              className={cn(
                "h-8 animate-pulse",
                index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
              )}
            />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
