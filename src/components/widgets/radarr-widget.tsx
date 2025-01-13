"use client";

import { Video } from "lucide-react";
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
import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { DataTablePagination } from "../ui/pagination";
import { DataTableColumnHeader } from "../ui/column-header";
import { DataTable } from "../ui/data-table";
import { DebugData } from "../debug-data";
import { WidgetButton, WidgetButtonFallback } from "../widget-button";
import type { GetMoviesResponse } from "@/app/api/widgets/[id]/radarr/route";
import { formatBytes } from "@/lib/format-bytes";

type Props = {
  service: ContainerService;
};

export function RadarrWidget({ service }: Props) {
  const columns: ColumnDef<GetMoviesResponse[number]>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Title" />;
        },
        cell: ({ row }) => {
          const url = new URL(`/movie/${row.original.titleSlug}`, service.url);
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
        accessorKey: "releaseDate",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Release Date" />;
        },
        cell: ({ row }) => {
          return (
            <span className="text-xs">
              {new Date(row.original.releaseDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "sizeOnDisk",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Size" />;
        },
        cell: ({ row }) => {
          return <span>{formatBytes(row.original.sizeOnDisk)}</span>;
        },
      },
    ],
    [service]
  );
  const { data } = useQuery({
    queryKey: ["widgets", "radarr", service.id],
    queryFn: async (): Promise<GetMoviesResponse> => {
      const response = await fetch(`/api/widgets/${service.id}/radarr`);
      if (!response.ok) {
        throw new Error("Failed to fetch Radarr movies");
      }

      return response.json() as Promise<GetMoviesResponse>;
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
    <Widget title="Movies" icon={<Video className="w-4 h-4" />}>
      {data ? (
        <Dialog>
          <DialogTrigger asChild>
            <WidgetButton>{data.length} movies</WidgetButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Movies</DialogTitle>
              <DialogDescription>
                All active Radarr movies for this container.
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
