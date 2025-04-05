"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  splitLink,
  httpBatchStreamLink,
  httpSubscriptionLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/app";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }

  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = makeQueryClient();
  }

  // Browser: use singleton pattern to keep the same query client
  return clientQueryClientSingleton;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // loggerLink(),
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            url: getUrl(),
            /**
             * @see https://trpc.io/docs/v11/data-transformers
             */
            transformer: superjson,
          }),
          false: httpBatchStreamLink({
            url: getUrl(),
            /**
             * @see https://trpc.io/docs/v11/data-transformers
             */
            transformer: superjson,
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
