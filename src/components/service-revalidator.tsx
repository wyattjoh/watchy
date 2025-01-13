"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function ServiceRevalidator() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource("/api/stream", {});

    // When the server sends an update, refresh the page.
    source.onmessage = () => {
      router.refresh();
      void queryClient.refetchQueries();
    };

    return () => {
      source.close();
    };
  }, [router, queryClient]);

  return null;
}
