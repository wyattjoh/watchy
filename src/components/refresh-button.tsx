"use client";

import { RefreshCwIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function RefreshButton() {
  const router = useRouter();
  const isFetching = useIsFetching();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(() => {
    router.refresh();
    void queryClient.refetchQueries();
  }, [router, queryClient]);

  return (
    <Button variant="outline" onClick={handleRefresh} disabled={isFetching > 0}>
      <RefreshCwIcon
        className={cn("h-4 w-4", isFetching ? "animate-spin" : "")}
      />{" "}
      Refresh
    </Button>
  );
}
