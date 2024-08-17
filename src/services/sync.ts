import { MAX_RETRY_ATTEMPTS, SYNC_BATCH_SIZE } from '@/constants';

import { ChatDB } from '@/client/db/schema';
import { SupabaseClient } from '@supabase/supabase-js';

export async function syncWithServer(db: ChatDB, supabase: SupabaseClient) {
  console.log("Starting sync with server...");

  try {
    await syncOutgoingMessages(db, supabase);
    await syncIncomingMessages(db, supabase);
    await syncConversations(db, supabase);
    await syncUsers(db, supabase);
    
    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}

async function syncOutgoingMessages(db: ChatDB, supabase: SupabaseClient) {
  console.log("Syncing outgoing messages...");
  const tx = db.transaction(['chat_messages', 'chat_send_message_request'], 'readwrite');
  const messageStore = tx.objectStore('chat_messages');
  const requestStore = tx.objectStore('chat_send_message_request');

  const pendingRequests = await requestStore.index('status').getAll('pending');

  for (const request of pendingRequests) {
    const message = await messageStore.get(request.messageId);
    if (!message) {
      console.warn(`Message ${request.messageId} not found for pending request`);
      continue;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .upsert({
          id: message.id,
          conversation_id: message.conversationId,
          sender_id: message.senderId,
          type: message.type,
          timestamp: message.timestamp,
        });

      if (error) throw error;

      message.status = 'sent';
      await messageStore.put(message);
      await requestStore.delete(request.id);
      console.log(`Message ${message.id} sent successfully`);
    } catch (error) {
      console.error(`Failed to sync message ${message.id}:`, error);
      request.failCount++;
      request.status = request.failCount >= MAX_RETRY_ATTEMPTS ? 'fail' : 'pending';
      await requestStore.put(request);
    }
  }

  await tx.done;
}

async function syncIncomingMessages(db: ChatDB, supabase: SupabaseClient) {
  console.log("Syncing incoming messages...");
  const tx = db.transaction(['chat_messages', 'chat_conversations'], 'readwrite');
  const messageStore = tx.objectStore('chat_messages');
  const conversationStore = tx.objectStore('chat_conversations');

  let lastSyncTimestamp = await getLastSyncTimestamp(db, 'messages');

  while (true) {
    const { data: newMessages, error } = await supabase
      .from('messages')
      .select('*')
      .gt('timestamp', lastSyncTimestamp)
      .order('timestamp', { ascending: true })
      .limit(SYNC_BATCH_SIZE);

    if (error) throw error;
    if (!newMessages || newMessages.length === 0) break;

    for (const message of newMessages) {
      await messageStore.put(message);

      const conversation = await conversationStore.get(message.conversation_id);
      if (conversation && message.timestamp > conversation.lastMessageTimestamp) {
        conversation.lastMessageTimestamp = message.timestamp;
        await conversationStore.put(conversation);
      }

      lastSyncTimestamp = Math.max(lastSyncTimestamp, message.timestamp);
    }

    console.log(`Synced ${newMessages.length} new messages`);
  }

  await setLastSyncTimestamp(db, 'messages', lastSyncTimestamp);
  await tx.done;
}

async function syncConversations(db: ChatDB, supabase: SupabaseClient) {
  console.log("Syncing conversations...");
  const tx = db.transaction('chat_conversations', 'readwrite');
  const store = tx.objectStore('chat_conversations');

  let lastSyncTimestamp = await getLastSyncTimestamp(db, 'conversations');

  while (true) {
    const { data: newConversations, error } = await supabase
      .from('conversations')
      .select('*')
      .gt('updated_at', lastSyncTimestamp)
      .order('updated_at', { ascending: true })
      .limit(SYNC_BATCH_SIZE);

    if (error) throw error;
    if (!newConversations || newConversations.length === 0) break;

    for (const conversation of newConversations) {
      await store.put(conversation);
      lastSyncTimestamp = Math.max(lastSyncTimestamp, conversation.updated_at);
    }

    console.log(`Synced ${newConversations.length} conversations`);
  }

  await setLastSyncTimestamp(db, 'conversations', lastSyncTimestamp);
  await tx.done;
}

async function syncUsers(db: ChatDB, supabase: SupabaseClient) {
  console.log("Syncing users...");
  const tx = db.transaction('chat_users', 'readwrite');
  const store = tx.objectStore('chat_users');

  let lastSyncTimestamp = await getLastSyncTimestamp(db, 'users');

  while (true) {
    const { data: newUsers, error } = await supabase
      .from('users')
      .select('*')
      .gt('updated_at', lastSyncTimestamp)
      .order('updated_at', { ascending: true })
      .limit(SYNC_BATCH_SIZE);

    if (error) throw error;
    if (!newUsers || newUsers.length === 0) break;

    for (const user of newUsers) {
      await store.put(user);
      lastSyncTimestamp = Math.max(lastSyncTimestamp, user.updated_at);
    }

    console.log(`Synced ${newUsers.length} users`);
  }

  await setLastSyncTimestamp(db, 'users', lastSyncTimestamp);
  await tx.done;
}

async function getLastSyncTimestamp(db: ChatDB, entity: string): Promise<number> {
  const tx = db.transaction('sync_metadata', 'readonly');
  const store = tx.objectStore('sync_metadata');
  const metadata = await store.get(entity);
  await tx.done;
  return metadata?.lastSyncTimestamp || 0;
}

async function setLastSyncTimestamp(db: ChatDB, entity: string, timestamp: number): Promise<void> {
  const tx = db.transaction('sync_metadata', 'readwrite');
  const store = tx.objectStore('sync_metadata');
  await store.put({ entity, lastSyncTimestamp: timestamp });
  await tx.done;
}