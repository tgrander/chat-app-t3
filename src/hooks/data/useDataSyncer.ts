import { type ChatDB } from "@/client/db/schema";
import { useInitDatabase } from "@/hooks/db";
import { createClient } from "@/utils/supabase/server";
import { RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import { type DBSchema } from "idb";
import { useEffect, useRef, useState } from "react";

/**
 * Initializes the DB and Websocket connection
 *
 * Manages online/offline status
 *
 * Handles incoming messages from the Websocket and adds updates to the local DB, keeping client DB and server DB in sync
 *
 * Handles sent messages
 *  - When a server confirms a message was sent, handleMessageSent updates the message status and removes the corresponding send request
 *  - This completes the sending process for a message
 *
 * Sending messages
 *  - sendMessage function creates a new message object, adds it to the local DB with status 'sending' and creates a send request
 *  - if online, it immediately tries to send the message via Websocket
 *  - if offline, the message waits in the DB to be sent later
 *
 * Processing send requests
 *  - Whenever the app goes back online, it checks for any pending send requests in the DB
 *  - For each pending request, it retrieves the corresponding message and tries to send it to the server
 *  - This handles messages that were created offline
 *
 * Syncing with the server
 *  - Request any messages from the server that the client might be missing, based on the last sync timestamp
 */

export function useDataSyncer() {
  const { db, error: dbError } = useInitDatabase();
  const { supabase, error: supabaseError } = useCreateSupaBaseClient();
  const { isConnected, channelRef, createRealTimeChannel } =
    useRealTimeChannel(db);

  useEffect(() => {
    if (dbError) {
      throw new Error(`Unable to init DB. Cancelling creation of Data Syncer`);
    }
    if (supabaseError) {
      throw new Error(`Error creating Supabase client: `, supabaseError);
    }

    let isMounted = true;

    if (supabase !== null) {
      createRealTimeChannel(supabase, { isMounted });
    }

    // Clean Up
    return () => {
      isMounted = false;
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, [db, dbError, supabase, isConnected, channelRef, createRealTimeChannel]);
}

function useCreateSupaBaseClient() {
  const supabaseRef = useRef<SupabaseClient<DBSchema> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabaseRef.current = supabase;
    } catch (error) {
      setError(error as Error);
    }
  }, [supabaseRef]);

  return {
    supabase: supabaseRef.current,
    error,
  };
}

type ServerEvent = {
  event_name:
    | "message_sent"
    | "message_delivered"
    | "message_failed"
    | "incoming_message"
    | "sync";
  payload: any;
};

function useRealTimeChannel(db: ChatDB | null) {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Create Real Time Supabase Channel
  function createRealTimeChannel(
    client: SupabaseClient<DBSchema>,
    { isMounted }: { isMounted: boolean },
  ) {
    if (client) {
      const channel = client
        .channel("message_event")
        .on(
          "broadcast",
          { event: "*" },
          (payload) => console.log("broadcast event: payload :>> ", payload),
          // handleServerInsertEvent(payload. as ServerEvent)
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            if (isMounted) {
              setIsConnected(true);
              console.log("Connected to Supabase real-time channel");
            }
          }
        });

      channelRef.current = channel;
    }
  }

  // Handle server event
  async function handleServerInsertEvent(event: ServerEvent) {
    if (!db) return;

    const eventHandlers = getMessageServerEventHandlers();

    switch (event.event_name) {
      case "message_sent":
        eventHandlers.handleMessageSent(db, event.payload);
        break;
      case "message_delivered":
        eventHandlers.handleMessageDelivered(db, event.payload);
        break;
      case "message_failed":
        eventHandlers.handleMessageFailed(db, event.payload);
        break;
      case "incoming_message":
        eventHandlers.handleMessageIncoming(db, event.payload);
        break;
      case "sync":
        eventHandlers.handleSync(db, event.payload);
        break;

      default:
        console.warn("Unknown event type:", event.event_name);
        break;
    }
  }

  return {
    isConnected,
    channelRef,
    createRealTimeChannel,
  };
}

function getMessageServerEventHandlers() {
  function handleMessageSent(db: ChatDB, payload: any) {
    console.log("handleMessageSent :>> ");
    console.log("payload :>> ", payload);
  }
  function handleMessageDelivered(db: ChatDB, payload: any) {
    console.log("handleMessageDelivered :>> ");
    console.log("payload :>> ", payload);
  }
  function handleMessageFailed(db: ChatDB, payload: any) {
    console.log("handleMessageFailed :>> ");
    console.log("payload :>> ", payload);
  }
  function handleMessageIncoming(db: ChatDB, payload: any) {
    console.log("handleMessageIncoming :>> ");
    console.log("payload :>> ", payload);
  }
  function handleSync(db: ChatDB, payload: any) {
    console.log("handleSync :>> ");
    console.log("payload :>> ", payload);
  }

  return {
    handleMessageSent,
    handleMessageDelivered,
    handleMessageIncoming,
    handleMessageFailed,
    handleSync,
  };
}
