import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

import {
  ChatDBSchema,
  type ChatDB,
  type Message,
  type User,
} from "@/client/db/schema";
import { useSupabaseClient } from "@/context/supabase/client";
import { useInitDatabase } from "@/hooks/db";

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
  const supabase = useSupabaseClient();
  const { db, error: dbError } = useInitDatabase();
  const {
    isConnected,
    channelRef,
    error: channelError,
  } = useRealTimeChannel(supabase, db);

  console.log("db :>> ", db);
  console.log("supabase :>> ", supabase);
  console.log("isConnected :>> ", isConnected);
  console.log("channelRef :>> ", channelRef);

  return { isConnected, error: dbError || channelError };
}

type BroadcastPayload = {
  type: "broadcast";
  event: string;
  [key: string]: any;
};

type ServerEvent =
  | { event_name: "message_sent"; payload: { messageId: string } }
  | { event_name: "message_delivered"; payload: { messageId: string } }
  | { event_name: "message_failed"; payload: { messageId: string } }
  | {
      event_name: "message_incoming";
      payload: { message: Message; sender: User };
    }
  | { event_name: "sync"; payload: any };

function useRealTimeChannel(
  supabase: SupabaseClient<ChatDBSchema>,
  db: ChatDB | null,
) {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    const channel = supabase
      .channel("message_event")
      .on("broadcast", { event: "*" }, (payload) => {
        const serverEvent = mapPayloadToServerEvent(payload);
        if (serverEvent) {
          handleServerEvent(serverEvent, db);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          console.log("Connected to Supabase real-time message channel.");
        } else if (status === "CLOSED") {
          setIsConnected(false);
          setError(new Error("Channel closed unexpectedly."));
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [db, supabase]);

  return {
    isConnected,
    channelRef,
    error,
  };
}

async function handleServerEvent(event: ServerEvent, db: ChatDB) {
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
    case "message_incoming":
      eventHandlers.handleMessageIncoming(db, event.payload);
      break;
    case "sync":
      eventHandlers.handleSync(db, event.payload);
      break;

    default:
      console.warn("Unknown event type:", event);
      break;
  }
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

function mapPayloadToServerEvent(
  payload: BroadcastPayload,
): ServerEvent | null {
  const { eventType, new: newRecord, old: oldRecord } = payload;

  switch (eventType) {
    case "INSERT":
      return {
        event_name: "message_incoming",
        payload: {
          message: newRecord as Message,
          sender: newRecord.sender as User, // Assuming sender info is included in the payload
        },
      };
    case "UPDATE":
      if (newRecord.status === "sent") {
        return {
          event_name: "message_sent",
          payload: { messageId: newRecord.id },
        };
      } else if (newRecord.status === "delivered") {
        return {
          event_name: "message_delivered",
          payload: { messageId: newRecord.id },
        };
      } else if (newRecord.status === "failed") {
        return {
          event_name: "message_failed",
          payload: { messageId: newRecord.id },
        };
      }
      break;
    // Add other cases as needed
  }

  console.warn("Unknown event type:", eventType);
  return null;
}
