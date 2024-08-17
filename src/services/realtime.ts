import { RealtimePayload, ServerEvent } from '@/types/events';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

import { ChatDB } from '@/client/db/schema';
import { handleServerEvent } from '@/utils/dbOperations';
import { mapPayloadToServerEvent } from '@/utils/eventMappers';

export function setupRealtimeChannel(
  supabase: SupabaseClient,
  db: ChatDB,
  setIsConnected: (isConnected: boolean) => void
) {
  let channel: RealtimeChannel | null = null;

  try {
    channel = supabase
      .channel("chat_events")
      .on<RealtimePayload>(
        "postgres_changes",
        { event: "*", schema: 'public' },
        async (payload) => {
          console.log("Received real-time payload:", payload);
          const serverEvent = mapPayloadToServerEvent(payload);
          if (serverEvent) {
            await processServerEvent(serverEvent, db);
          }
        }
      )
      .subscribe(async (status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          console.log("Connected to Supabase real-time channel");
          await performInitialSync(db, supabase);
        } else if (status === "CLOSED") {
          setIsConnected(false);
          console.log("Disconnected from Supabase real-time channel");
        }
      });

    return {
      unsubscribe: () => {
        if (channel) {
          console.log("Unsubscribing from real-time channel");
          channel.unsubscribe();
        }
      },
      error: null
    };
  } catch (error) {
    console.error("Error setting up real-time channel:", error);
    return {
      unsubscribe: () => {},
      error: error instanceof Error ? error : new Error("Unknown error occurred while setting up real-time channel")
    };
  }
}

async function processServerEvent(event: ServerEvent, db: ChatDB) {
  console.log("Processing server event:", event);
  try {
    await handleServerEvent(event, db);
  } catch (error) {
    console.error("Error processing server event:", error);
  }
}

async function performInitialSync(db: ChatDB, supabase: SupabaseClient) {
  console.log("Performing initial sync");
  try {
    // Implement your initial sync logic here
    // This could involve fetching the latest data from the server
    // and updating the local database
    // For example:
    // await syncWithServer(db, supabase);
  } catch (error) {
    console.error("Error during initial sync:", error);
  }
}