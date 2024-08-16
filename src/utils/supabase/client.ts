import { env } from "@/env";
import { type Database } from "@/types/supabase/database";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {},
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
        heartbeatIntervalMs: 5000,
        reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 5000),
        logger: (msg: string) => console.log(msg),
      },
    },
  );
}

export const supabase = createClient();
