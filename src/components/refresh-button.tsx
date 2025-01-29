"use client";

import { RefreshCwIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function RefreshButton() {
  const isFetching = useIsFetching();
  const client = useQueryClient();

  const handleRefresh = useCallback(() => {
    void client.refetchQueries();
  }, [client]);

  return (
    <Button variant="outline" onClick={handleRefresh} disabled={isFetching > 0}>
      <RefreshCwIcon
        className={cn("h-4 w-4", isFetching ? "animate-spin" : "")}
      />{" "}
      Refresh
    </Button>
  );
}
