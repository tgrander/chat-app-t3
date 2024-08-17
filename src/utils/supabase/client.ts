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
        // Enhanced logging filter
        logger: (msg: string) => {
          if (
            (msg.includes('ERROR') || msg.includes('WARN')) &&
            !msg.includes('push') &&
            !msg.includes('receive')
          ) {
            console.log(msg);
          }
        },
      }
    },
  );
}

export const supabase = createClient();
