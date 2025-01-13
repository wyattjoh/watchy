"use client";

import { Tv } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Widget } from "../widget";
import type { ContainerService } from "@/types/service";
import type { GetSeriesResponse } from "@/app/api/widgets/[id]/sonarr/route";
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
import { WidgetButton, WidgetButtonFallback } from "../widget-button";
import { formatBytes } from "@/lib/format-bytes";

type Props = {
  service: ContainerService;
};

export function SonarrWidget({ service }: Props) {
  const columns: ColumnDef<GetSeriesResponse[number]>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Title" />;
        },
        cell: ({ row }) => {
          const url = new URL(`/series/${row.original.titleSlug}`, service.url);
          return (
            <a href={url.toString()} target="_blank" rel="noreferrer noopener">
              {row.original.title}
            </a>
          );
        },
        sortingFn: (a, b) => {
          return a.original.sortTitle.localeCompare(b.original.sortTitle);
        },
      },
      {
        accessorKey: "statistics.seasonCount",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Seasons" />;
        },
      },
      {
        accessorKey: "statistics.episodeCount",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Episodes" />;
        },
      },
      {
        accessorKey: "statistics.sizeOnDisk",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Size" />;
        },
        sortingFn: (a, b) => {
          return (
            a.original.statistics.sizeOnDisk - b.original.statistics.sizeOnDisk
          );
        },
        cell: ({ row }) => {
          return <span>{formatBytes(row.original.statistics.sizeOnDisk)}</span>;
        },
      },
    ],
    [service]
  );
  const { data } = useQuery({
    queryKey: ["widgets", "sonarr", service.id],
    queryFn: async (): Promise<GetSeriesResponse> => {
      const response = await fetch(`/api/widgets/${service.id}/sonarr`);
      if (!response.ok) {
        throw new Error("Failed to fetch Sonarr series");
      }

      return response.json() as Promise<GetSeriesResponse>;
    },
    refetchInterval: 60000,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: data ?? [],
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

  return (
    <Widget title="TV Shows" icon={<Tv className="w-4 h-4" />}>
      {data ? (
        <Dialog>
          <DialogTrigger asChild>
            <WidgetButton>{data.length} series</WidgetButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>TV Series</DialogTitle>
              <DialogDescription>
                All active Sonarr series for this container.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center py-4">
              <Input
                placeholder="Filter titles..."
                value={
                  (table.getColumn("title")?.getFilterValue() as string) || ""
                }
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
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
