"use client";

import { SupabaseClientProvider } from "@/context/supabase/client";
import { createClient } from "@/utils/supabase/client";

export async function SupabaseProvider({ children }: React.PropsWithChildren) {
  const supabase = createClient();
  return (
    <SupabaseClientProvider client={supabase}>
      {children}
    </SupabaseClientProvider>
  );
}
