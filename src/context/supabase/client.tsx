"use client";

import { type ChatDBSchema } from "@/client/db/schema";
import { type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

const SupabaseContext = createContext<SupabaseClient<ChatDBSchema> | undefined>(
  undefined,
);

export interface SupabaseProviderProps {
  children: React.ReactNode;
  client: SupabaseClient<ChatDBSchema>;
}

export function SupabaseClientProvider({
  children,
  client,
}: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={client}>
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
