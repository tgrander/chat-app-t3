import { DBSchema, IDBPDatabase, openDB } from "idb";

export interface User {
  id: string;
  name: string;
  avatar: string | null;
  status: UserPresenceStatus;
  lastSeen: number; // Timestamp
  createdAt: number; // Timestamp
}

export const MessageStatus = {
  Sending: "sending",
  Sent: "sent",
  Delivered: "delivered",
  Read: "read",
  Failed: "failed",
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const MessageType = {
  Text: "text",
  Image: "image",
  File: "file",
  Audio: "audio",
  Video: "video",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const UserPresenceStatus = {
  Online: "online",
  Offline: "offline",
  Away: "away",
} as const;

export type UserPresenceStatus = (typeof UserPresenceStatus)[keyof typeof UserPresenceStatus];

export interface Conversation {
  id: string;
  name: string | null;
  avatar: string | null;
  lastMessageTimestamp: number; // Timestamp
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  lastReadTimestamp: number; // Timestamp
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  parentMessageId: string | null;
  type: MessageType;
  status: MessageStatus;
  timestamp: number; // Timestamp
  version: number;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface TextMessage {
  messageId: string;
  content: string;
}

export interface MediaMessage {
  messageId: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number | null; // in seconds
  width: number | null;
  height: number | null;
}

export interface FileMessage {
  messageId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  reaction: string;
  timestamp: number; // Timestamp
}

export interface DraftMessage extends Omit<Message, "status"> {}

export interface SendMessageRequest {
  id: string;
  messageId: string;
  status: "pending" | "in_flight" | "fail" | "success";
  failCount: number;
  lastSentAt: number; // timestamp
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

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
  }
}

const DB_NAME = "ChatAppDB";
const DB_VERSION = 1;

async function openDatabase(): Promise<IDBPDatabase<ChatDBSchema>> {
  return openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      const userStore = db.createObjectStore("chat_users", { keyPath: "id" });
      userStore.createIndex("lastSeen", "lastSeen");

      // Conversations store
      const conversationStore = db.createObjectStore("chat_conversations", { keyPath: "id" });
      conversationStore.createIndex("lastMessageTimestamp", "lastMessageTimestamp");

      // Conversation participants store
      const participantStore = db.createObjectStore("chat_conversation_participants", { keyPath: ["conversationId", "userId"] });
      participantStore.createIndex("userId", "userId");

      // Messages store
      const messageStore = db.createObjectStore("chat_messages", { keyPath: "id" });
      messageStore.createIndex("conversationId", "conversationId");
      messageStore.createIndex("senderId", "senderId");
      messageStore.createIndex("timestamp", "timestamp");
      messageStore.createIndex("type", "type");
      messageStore.createIndex("parentMessageId", "parentMessageId");

      // Text messages store
      db.createObjectStore("chat_text_messages", { keyPath: "messageId" });

      // Media messages store
      db.createObjectStore("chat_media_messages", { keyPath: "messageId" });

      // File messages store
      db.createObjectStore("chat_file_messages", { keyPath: "messageId" });

      // Reactions store
      const reactionStore = db.createObjectStore("chat_reactions", { keyPath: "id" });
      reactionStore.createIndex("messageId", "messageId");
      reactionStore.createIndex("userId", "userId");

      // Draft messages store
      const draftMessagesStore = db.createObjectStore("chat_draft_messages", {keyPath: ["conversationId", "userId"]})
      draftMessagesStore.createIndex("updatedAt", "updatedAt")

      // Send message requests store
      const sendMessageRequestStore = db.createObjectStore("chat_send_message_request", {keyPath: "id"})
      sendMessageRequestStore.createIndex("status", "status")
      sendMessageRequestStore.createIndex("messageId", "messageId")
      sendMessageRequestStore.createIndex("lastSentAt", "lastSentAt")
    },
  });
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