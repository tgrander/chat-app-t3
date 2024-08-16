"use client";

import { SupabaseClientProvider } from "@/context/supabase/client";
import { useDataSyncer } from "@/hooks/data/useDataSyncer";

export function Providers({ children }: React.PropsWithChildren) {
  useDataSyncer();

  return <SupabaseClientProvider>{children}</SupabaseClientProvider>;
}
