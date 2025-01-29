"use client";

import { CloudDownload, Download, Gauge } from "lucide-react";
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
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { DataTablePagination } from "../ui/pagination";
import { DataTableColumnHeader } from "../ui/column-header";
import { DataTable } from "../ui/data-table";
import { DebugData } from "../debug-data";
import { WidgetButton, WidgetButtonFallback } from "../widget-button";
import { formatBytes } from "@/lib/format-bytes";
import { Badge } from "../ui/badge";
import { trpc } from "@/trpc/client";
import type { NZBGetListGroup } from "@/trpc/routers/widgets/nzbget";

const DEFAULT_REFETCH_INTERVAL = 60000;

type Props = {
  service: ContainerService;
};

const columns: ColumnDef<NZBGetListGroup>[] = [
  {
    accessorKey: "NZBName",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Name" />;
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
];

export function NZBGetWidget({ service }: Props) {
  const [refetchInterval, setRefetchInterval] = useState(
    DEFAULT_REFETCH_INTERVAL
  );
  const { data: status } = trpc.widgets.nzbget.getStatus.useQuery(
    { id: service.id },
    { refetchInterval }
  );

  const { data: listGroups } = trpc.widgets.nzbget.getListGroups.useQuery(
    { id: service.id },
    { refetchInterval }
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: listGroups?.result ?? [],
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
    if (!listGroups) return;

    if (listGroups.result.length === 0) {
      setRefetchInterval(DEFAULT_REFETCH_INTERVAL);
    } else {
      setRefetchInterval(1000);
    }
  }, [listGroups]);

  return (
    <Widget title="Downloads" icon={<CloudDownload className="w-4 h-4" />}>
      {listGroups && status ? (
        <Dialog>
          <DialogTrigger asChild>
            <WidgetButton>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Download />
                  {listGroups.result.length}
                </div>
                <div className="flex items-center gap-2">
                  <Gauge />
                  {formatBytes(status.result.DownloadRate)}/s
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
                placeholder="Filter downloads..."
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
            <DebugData data={{ status, listGroups }} />
          </DialogContent>
        </Dialog>
      ) : (
        <WidgetButtonFallback />
      )}
    </Widget>
  );
}
