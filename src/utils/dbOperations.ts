import type { Message, SendMessageRequest, User } from '@/client/db/types';
import { DB_STORE_NAMES, MAX_RETRY_ATTEMPTS } from '@/constants';

import { ChatDB } from '@/client/db/schema';
import { ServerEvent } from '@/types/events';

export async function handleServerEvent(event: ServerEvent, db: ChatDB) {
  console.log('Handling server event:', event);

  switch (event.event_name) {
    case 'message_sent':
      await handleMessageSent(db, event.payload.messageId);
      break;
    case 'message_delivered':
      await handleMessageDelivered(db, event.payload.messageId);
      break;
    case 'message_failed':
      await handleMessageFailed(db, event.payload.messageId);
      break;
    case 'message_incoming':
      await handleMessageIncoming(db, event.payload.message);
      break;
    default:
      console.warn('Unknown event type:', event);
  }
}

async function handleMessageSent(db: ChatDB, messageId: string) {
  const tx = db.transaction([DB_STORE_NAMES.MESSAGES, DB_STORE_NAMES.SEND_MESSAGE_REQUESTS], 'readwrite');
  const messageStore = tx.objectStore(DB_STORE_NAMES.MESSAGES);
  const requestStore = tx.objectStore(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS);

  const message = await messageStore.get(messageId);
  if (message) {
    message.status = 'sent';
    await messageStore.put(message);
  }

  await requestStore.delete(messageId);
  await tx.done;

  console.log(`Message ${messageId} marked as sent`);
}

async function handleMessageDelivered(db: ChatDB, messageId: string) {
  const tx = db.transaction(DB_STORE_NAMES.MESSAGES, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAMES.MESSAGES);

  const message = await store.get(messageId);
  if (message) {
    message.status = 'delivered';
    await store.put(message);
  }
  await tx.done;

  console.log(`Message ${messageId} marked as delivered`);
}

async function handleMessageFailed(db: ChatDB, messageId: string) {
  const tx = db.transaction([DB_STORE_NAMES.MESSAGES, DB_STORE_NAMES.SEND_MESSAGE_REQUESTS], 'readwrite');
  const messageStore = tx.objectStore(DB_STORE_NAMES.MESSAGES);
  const requestStore = tx.objectStore(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS);

  const message = await messageStore.get(messageId);
  if (message) {
    message.status = 'failed';
    await messageStore.put(message);
  }

  const request = await requestStore.get(messageId);
  if (request) {
    request.failCount++;
    request.status = request.failCount >= MAX_RETRY_ATTEMPTS ? 'fail' : 'pending';
    await requestStore.put(request);
  }
  await tx.done;

  console.log(`Message ${messageId} marked as failed`);
}

async function handleMessageIncoming(db: ChatDB, message: Message) {
  const tx = db.transaction([DB_STORE_NAMES.MESSAGES, DB_STORE_NAMES.USERS, DB_STORE_NAMES.CONVERSATIONS], 'readwrite');
  const messageStore = tx.objectStore(DB_STORE_NAMES.MESSAGES);
  const conversationStore = tx.objectStore(DB_STORE_NAMES.CONVERSATIONS);

  await messageStore.add(message);

  const conversation = await conversationStore.get(message.conversationId);
  if (conversation) {
    conversation.lastMessageTimestamp = message.timestamp;
    await conversationStore.put(conversation);
  }

  await tx.done;

  console.log(`Incoming message ${message.id} processed`);
}

export async function addMessage(db: ChatDB, message: Message): Promise<void> {
  const tx = db.transaction([DB_STORE_NAMES.MESSAGES, DB_STORE_NAMES.SEND_MESSAGE_REQUESTS], 'readwrite');
  const messageStore = tx.objectStore(DB_STORE_NAMES.MESSAGES);
  const requestStore = tx.objectStore(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS);

  await messageStore.add(message);

  const sendRequest: SendMessageRequest = {
    id: message.id,
    messageId: message.id,
    status: 'pending',
    failCount: 0,
    lastSentAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await requestStore.add(sendRequest);

  await tx.done;

  console.log(`Message ${message.id} added to local database`);
}

export async function getUser(db: ChatDB, userId: string): Promise<User | undefined> {
  const tx = db.transaction(DB_STORE_NAMES.USERS, 'readonly');
  const store = tx.objectStore(DB_STORE_NAMES.USERS);

  const user = await store.get(userId);
  await tx.done;

  return user;
}

export async function updateUser(db: ChatDB, user: User): Promise<void> {
  const tx = db.transaction(DB_STORE_NAMES.USERS, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAMES.USERS);

  await store.put(user);
  await tx.done;

  console.log(`User ${user.id} updated in local database`);
}

export async function getPendingSendRequests(db: ChatDB): Promise<SendMessageRequest[]> {
  const tx = db.transaction(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS, 'readonly');
  const store = tx.objectStore(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS);
  const index = store.index('status');

  const requests = await index.getAll(IDBKeyRange.only('pending'));
  await tx.done;

  return requests;
}

export async function updateSendRequest(db: ChatDB, request: SendMessageRequest): Promise<void> {
  const tx = db.transaction(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS);

  await store.put(request);
  await tx.done;

  console.log(`Send request for message ${request.messageId} updated`);
}

export async function deleteSendRequest(db: ChatDB, requestId: string): Promise<void> {
  const tx = db.transaction(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS);

  await store.delete(requestId);
  await tx.done;

  console.log(`Send request ${requestId} deleted`);
}

export async function getLastSyncTimestamp(db: ChatDB, entity: string): Promise<number> {
  const tx = db.transaction(DB_STORE_NAMES.SYNC_METADATA, 'readonly');
  const store = tx.objectStore(DB_STORE_NAMES.SYNC_METADATA);
  const metadata = await store.get(entity);
  await tx.done;
  return metadata?.lastSyncTimestamp || 0;
}

export async function setLastSyncTimestamp(db: ChatDB, entity: string, timestamp: number): Promise<void> {
  const tx = db.transaction(DB_STORE_NAMES.SYNC_METADATA, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAMES.SYNC_METADATA);
  await store.put({ entity, lastSyncTimestamp: timestamp });
  await tx.done;
  console.log(`Last sync timestamp for ${entity} set to ${timestamp}`);
}