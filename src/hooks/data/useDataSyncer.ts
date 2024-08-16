import { useInitDatabase } from "@/hooks/db";
import { createClient } from "@/utils/supabase/server";
import { useEffect } from "react";

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

  if (dbError) {
    console.error("Error creating DB context provider: ", dbError);
  }
}

function useRealTime() {
  const supabase = createClient();

  useEffect(() => {
    supabase
      .channel("message_event")
      .on("broadcast", { event: "*" }, (payload) =>
        console.log("real time event payload :>> ", payload),
      )
      .subscribe();
  }, [supabase]);

  //   async function handleServerInsertEvent(event: RealtimePostgresInsertPayload) {

  //   }
}
