"use client";

import { CloudDownload, Download, Gauge } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Widget } from "../widget";
import type { ContainerService } from "@/types/service";
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
import { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import { DataTablePagination } from "../ui/pagination";
import { DataTableColumnHeader } from "../ui/column-header";
import { DataTable } from "../ui/data-table";
import { DebugData } from "../debug-data";
import { WidgetButton, WidgetButtonFallback } from "../widget-button";
import type {
  NZBGetListGroup,
  NZBGetWidgetResponse,
} from "@/app/api/widgets/[id]/nzbget/route";
import { formatBytes } from "@/lib/format-bytes";
import { Badge } from "../ui/badge";

const DEFAULT_REFETCH_INTERVAL = 60000;

type Props = {
  service: ContainerService;
};

export function NZBGetWidget({ service }: Props) {
  const columns: ColumnDef<NZBGetListGroup>[] = useMemo(
    () => [
      {
        accessorKey: "NZBName",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Name" />;
        },
        cell: ({ row }) => {
          if (!service.url) return row.original.NZBName;

          const { pathname } = new URL(service.url);
          const url = new URL(
            `${pathname}/system/${row.original.NZBName}`,
            service.url
          );

          return (
            <span className="flex items-center gap-2">
              <a
                href={url.toString()}
                target="_blank"
                rel="noreferrer noopener"
              >
                {row.original.NZBName}
              </a>
            </span>
          );
        },
      },
      {
        accessorKey: "Status",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Status" />;
        },
        cell: ({ row }) => {
          return <Badge variant="outline">{row.original.Status}</Badge>;
        },
      },
    ],
    [service]
  );
  const [refetchInterval, setRefetchInterval] = useState(
    DEFAULT_REFETCH_INTERVAL
  );
  const { data } = useQuery({
    queryKey: ["widgets", "nzbget", service.id],
    queryFn: async (): Promise<NZBGetWidgetResponse> => {
      const response = await fetch(`/api/widgets/${service.id}/nzbget`);
      if (!response.ok) {
        throw new Error("Failed to fetch NZBGet response");
      }

      return response.json() as Promise<NZBGetWidgetResponse>;
    },
    refetchInterval,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: data?.listGroups.result ?? [],
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

  useEffect(() => {
    if (!data) return;

    if (data.listGroups.result.length === 0) {
      setRefetchInterval(DEFAULT_REFETCH_INTERVAL);
    } else {
      setRefetchInterval(1000);
    }
  }, [data]);

  return (
    <Widget title="Downloads" icon={<CloudDownload className="w-4 h-4" />}>
      {data ? (
        <Dialog>
          <DialogTrigger asChild>
            <WidgetButton>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Download />
                  {data.listGroups.result.length}
                </div>
                <div className="flex items-center gap-2">
                  <Gauge />
                  {formatBytes(data.status.result.DownloadRate)}/s
                </div>
              </div>
            </WidgetButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Downloads</DialogTitle>
              <DialogDescription>
                All downloads monitored by NZBGet.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center py-4">
              <Input
                placeholder="Filter systems..."
                value={
                  (table.getColumn("NZBName")?.getFilterValue() as string) || ""
                }
                onChange={(event) =>
                  table.getColumn("NZBName")?.setFilterValue(event.target.value)
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
