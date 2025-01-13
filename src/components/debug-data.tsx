"use client";

import { useStore } from "@/lib/store";

type Props = {
  data: unknown;
};

export function DebugData({ data }: Props) {
  const dev = useStore((state) => state.context.dev);
  if (!dev) return null;

  return (
    <textarea
      className="text-xs mt-4 bg-gray-900 p-4 rounded-md w-full h-[200px]"
      readOnly
      value={JSON.stringify(data, null, 2)}
    />
  );
}
