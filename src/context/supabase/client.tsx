import { type ChatDBSchema } from "@/client/db/schema";
import { supabase } from "@/utils/supabase/client";
import { type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

const SupabaseContext = createContext<SupabaseClient<ChatDBSchema> | undefined>(
  undefined,
);

export function SupabaseClientProvider({ children }: React.PropsWithChildren) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseClient() {
  const clientContext = useContext(SupabaseContext);
  if (!clientContext) {
    throw new Error(
      "useSupabaseClient must be used within a SupabaseClientProvider.",
    );
  }
  return clientContext;
}
