import { DBSchema, IDBPDatabase, openDB } from "idb";
import type {
  Conversation,
  ConversationParticipant,
  DraftMessage,
  FileMessage,
  MediaMessage,
  Message,
  Reaction,
  SendMessageRequest,
  SyncMetadata,
  TextMessage,
  User,
} from "./types";

import { DB_STORE_NAMES } from "@/constants";

export interface ChatDBSchema extends DBSchema {
  chat_users: {
    key: string;
    value: User;
    indexes: { lastSeen: number };
  };
  chat_conversations: {
    key: string;
    value: Conversation;
    indexes: { lastMessageTimestamp: number };
    byLastMessageTimestamp: number;
  };
  chat_conversation_participants: {
    key: [string, string]; // [conversationId, userId]
    value: ConversationParticipant;
    indexes: { userId: string };
  };
  chat_messages: {
    key: string;
    value: Message;
    indexes: {
      conversationId: string;
      senderId: string;
      timestamp: number;
      type: string;
      parentMessageId: string;
      byConversationAndTimestamp: [string, number];
    };
  };
  chat_text_messages: {
    key: string; // messageId
    value: TextMessage;
  };
  chat_media_messages: {
    key: string; // messageId
    value: MediaMessage;
  };
  chat_file_messages: {
    key: string; // messageId
    value: FileMessage;
  };
  chat_reactions: {
    key: string;
    value: Reaction;
    indexes: { messageId: string; userId: string };
  };
  chat_draft_messages: {
    key: string;
    value: DraftMessage;
    indexes: {updatedAt: number}
  };
  chat_send_message_request: {
    key: string;
    value: SendMessageRequest;
    indexes: {status: string; messageId: string; lastSentAt: number}
  };
  sync_metadata: {
    key: string;
    value: SyncMetadata;
    indexes: { 'by-entity': string };
  };
}

const DB_NAME = "ChatAppDB";
const DB_VERSION = 1;

async function openDatabase(): Promise<IDBPDatabase<ChatDBSchema>> {
  try {
    return await openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

        if (oldVersion < 1) {
          createStoresV1(db);
        }
        // Add more version checks for future schema updates
        // if (oldVersion < 2) {
        //   updateStoresV2(db, transaction);
        // }
      },
    });
  } catch (error) {
    console.error('Failed to open database:', error);
    throw new Error('Failed to open database. Please refresh the page and try again.');
  }
}

function createStoresV1(db: IDBPDatabase<ChatDBSchema>): void {
  createUserStore(db);
  createConversationStore(db);
  createConversationParticipantsStore(db);
  createMessagesStore(db);
  createMessageContentStores(db);
  createReactionsStore(db);
  createDraftMessagesStore(db);
  createSendMessageRequestStore(db);
  createSyncMetadataStore(db);
}

function createUserStore(db: IDBPDatabase<ChatDBSchema>): void {
  const store = db.createObjectStore(DB_STORE_NAMES.USERS, { keyPath: "id" });
  store.createIndex("lastSeen", "lastSeen");
}

function createConversationStore(db: IDBPDatabase<ChatDBSchema>): void {
  const store = db.createObjectStore(DB_STORE_NAMES.CONVERSATIONS, { keyPath: "id" });
  store.createIndex("lastMessageTimestamp", "lastMessageTimestamp");
}

function createConversationParticipantsStore(db: IDBPDatabase<ChatDBSchema>): void {
  const store = db.createObjectStore(DB_STORE_NAMES.CONVERSATION_PARTICIPANTS, { keyPath: ["conversationId", "userId"] });
  store.createIndex("userId", "userId");
}

function createMessagesStore(db: IDBPDatabase<ChatDBSchema>): void {
  const store = db.createObjectStore(DB_STORE_NAMES.MESSAGES, { keyPath: "id" });
  store.createIndex("conversationId", "conversationId");
  store.createIndex("senderId", "senderId");
  store.createIndex("timestamp", "timestamp");
  store.createIndex("type", "type");
  store.createIndex("parentMessageId", "parentMessageId");
  store.createIndex("byConversationAndTimestamp", ["conversationId", "timestamp"])
}

function createMessageContentStores(db: IDBPDatabase<ChatDBSchema>): void {
  db.createObjectStore(DB_STORE_NAMES.TEXT_MESSAGES, { keyPath: "messageId" });
  db.createObjectStore(DB_STORE_NAMES.MEDIA_MESSAGES, { keyPath: "messageId" });
  db.createObjectStore(DB_STORE_NAMES.FILE_MESSAGES, { keyPath: "messageId" });
}

function createReactionsStore(db: IDBPDatabase<ChatDBSchema>): void {
  const store = db.createObjectStore(DB_STORE_NAMES.REACTIONS, { keyPath: "id" });
  store.createIndex("messageId", "messageId");
  store.createIndex("userId", "userId");
}

function createDraftMessagesStore(db: IDBPDatabase<ChatDBSchema>): void {
  const store = db.createObjectStore(DB_STORE_NAMES.DRAFT_MESSAGES, { keyPath: ["conversationId", "userId"] });
  store.createIndex("updatedAt", "updatedAt");
}

function createSendMessageRequestStore(db: IDBPDatabase<ChatDBSchema>): void {
  const store = db.createObjectStore(DB_STORE_NAMES.SEND_MESSAGE_REQUESTS, { keyPath: "id" });
  store.createIndex("status", "status");
  store.createIndex("messageId", "messageId");
  store.createIndex("lastSentAt", "lastSentAt");
}

function createSyncMetadataStore(db: IDBPDatabase<ChatDBSchema>): void {
  if (!db.objectStoreNames.contains(DB_STORE_NAMES.SYNC_METADATA)) {
    const store = db.createObjectStore(DB_STORE_NAMES.SYNC_METADATA, { keyPath: 'entity' });
    store.createIndex('by-entity', 'entity', { unique: true });
  }
}

export async function initDatabase() {
  try {
    const db = await openDatabase();
    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Error initializing database: ", error);
    throw error;
  }
}

export type ChatDB = IDBPDatabase<ChatDBSchema>;