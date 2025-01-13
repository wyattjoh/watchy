"use client";

import { HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Widget } from "../widget";
import type { ContainerService } from "@/types/service";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "../ui/dialog";
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { DataTablePagination } from "../ui/pagination";
import { DataTableColumnHeader } from "../ui/column-header";
import { DataTable } from "../ui/data-table";
import { DebugData } from "../debug-data";
import type {
  BeszelResponse,
  ItemsItem,
} from "@/app/api/widgets/[id]/beszel/route";
import { WidgetButton, WidgetButtonFallback } from "../widget-button";
import { formatSeconds } from "@/lib/format-seconds";

const DEFAULT_REFETCH_INTERVAL = 60000;

type Props = {
  service: ContainerService;
};

export function BeszelHubWidget({ service }: Props) {
  const columns: ColumnDef<ItemsItem>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Name" />;
        },
        cell: ({ row }) => {
          const url = new URL(`/system/${row.original.name}`, service.url);
          return (
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  row.original.status === "up" && "bg-green-500",
                  row.original.status === "down" && "bg-red-500",
                  row.original.status === "paused" && "bg-yellow-500",
                  row.original.status === "pending" && "bg-gray-500"
                )}
              />
              <a
                href={url.toString()}
                target="_blank"
                rel="noreferrer noopener"
              >
                {row.original.name}
              </a>
            </span>
          );
        },
      },
      {
        accessorKey: "info.u",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Uptime" />;
        },
        cell: ({ row }) => {
          return (
            <span className="font-mono">
              {formatSeconds(row.original.info.u)}
            </span>
          );
        },
      },
      {
        accessorKey: "info.cpu",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="CPU" />;
        },
        cell: ({ row }) => {
          return (
            <span className="font-mono">{`${row.original.info.cpu.toString()}%`}</span>
          );
        },
      },
      {
        accessorKey: "info.mp",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Memory" />;
        },
        cell: ({ row }) => {
          return (
            <span className="font-mono">{`${row.original.info.mp.toString()}%`}</span>
          );
        },
      },
      {
        accessorKey: "info.dp",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Disk" />;
        },
        cell: ({ row }) => {
          return (
            <span className="font-mono">{`${row.original.info.dp.toString()}%`}</span>
          );
        },
      },
    ],
    [service]
  );
  const [refetchInterval, setRefetchInterval] = useState(
    DEFAULT_REFETCH_INTERVAL
  );
  const { data } = useQuery({
    queryKey: ["widgets", "beszel", service.id],
    queryFn: async (): Promise<BeszelResponse> => {
      const response = await fetch(`/api/widgets/${service.id}/beszel`);
      if (!response.ok) {
        throw new Error("Failed to fetch Beszel series");
      }

      return response.json() as Promise<BeszelResponse>;
    },
    refetchInterval,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const onOpenChange = (open: boolean) => {
    setRefetchInterval(open ? 5000 : DEFAULT_REFETCH_INTERVAL);
  };

  const stats = useMemo(() => {
    if (!data) return null;

    return {
      up: data.items.filter((item) => item.status === "up").length,
      down: data.items.filter((item) => item.status === "down").length,
      paused: data.items.filter((item) => item.status === "paused").length,
      pending: data.items.filter((item) => item.status === "pending").length,
    };
  }, [data]);

  return (
    <Widget title="Systems" icon={<HardDrive className="w-4 h-4" />}>
      {data && stats ? (
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <WidgetButton>
              <div className="flex items-center gap-2">
                {stats.up > 0 && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />{" "}
                    {stats.up} up
                  </>
                )}
                {stats.down > 0 && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />{" "}
                    {stats.down} down
                  </>
                )}
                {stats.paused > 0 && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />{" "}
                    {stats.paused} paused
                  </>
                )}
                {stats.pending > 0 && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-500" />{" "}
                    {stats.pending} pending
                  </>
                )}
              </div>
            </WidgetButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Systems</DialogTitle>
              <DialogDescription>
                All systems monitored by Beszel.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center py-4">
              <Input
                placeholder="Filter systems..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) || ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className=""
              />
            </div>
            <DataTable table={table} columns={columns} />
            <DataTablePagination table={table} />
            <DebugData data={data} />
          </DialogContent>
        </Dialog>
      ) : (
        <WidgetButtonFallback />
      )}
    </Widget>
  );
}
