"use client";

import { useDataSyncer } from "@/hooks/data/useDataSyncer";

export function Providers({ children }: React.PropsWithChildren) {
  useDataSyncer();

  return <>{children}</>;
}
