import { DBSchema, IDBPDatabase, openDB } from "idb";

export const MessageStatus = {
  Sending: "sending",
  Sent: "sent",
  Delivered: "delivered",
  Read: "read",
  Failed: "failed",
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const MessageReactionOption = {
  Like: { id: "like", emoji: "👍🏽", label: "Like" },
  Love: { id: "love", emoji: "♥️", label: "Love" },
  Angry: { id: "angry", emoji: "😡", label: "Angry" },
  Laugh: { id: "laugh", emoji: "😂", label: "Laugh" },
  Sad: { id: "sad", emoji: "😢", label: "Sad" },
} as const;

export type MessageReactionOption =
  (typeof MessageReactionOption)[keyof typeof MessageReactionOption];

export const UserPresenceStatus = {
  Online: { id: "online", color: "green", label: "Online" },
  Offline: { id: "offline", color: "gray", label: "Offline" },
  Away: { id: "away", color: "yellow", label: "Away" },
} as const;

export type UserPresenceStatus =
  (typeof UserPresenceStatus)[keyof typeof UserPresenceStatus];

export interface Conversation {
  id: string;
  participants: string[];
  lastMessageTimestamp: number;
  name?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
  lastReadTimestamp: { [userId: string]: number };
}

export type MessageType = "text" | "image" | "file" | "audio" | "video";

export interface MessageMetadata {
  fileName?: string;
  fileSize?: number;
  duration?: number; // for audio/video
  dimensions?: { width: number; height: number }; // for images/videos
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  timestamp: string;
  reaction: MessageReactionOption;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  timestamp: number;
  type: MessageType;
  status: MessageStatus;
  content: string | { url: string; metadata: MessageMetadata };
  reactions: { [userId: string]: Reaction };
  parentMessageId?: string;
  localId?: string; // used for optimistic updates - local tracking before server confirmation
  version: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserPresenceStatus;
  lastSeen: number;
}

export interface DraftMessage {
  conversationId: string;
  userId: string;
  content: string;
  timestamp: number;
}

export interface SendMessageRequest {
  id: string;
  messageId: string;
  status: "pending" | "in_flight" | "fail" | "success";
  failCount: number;
  timestamp: number;
}

export interface Attachment {
  id: string;
  messageId: string;
  type: "image" | "file" | "audio" | "video";
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface ChatDBSchema extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { lastSeen: number };
  };
  conversations: {
    key: string;
    value: Conversation;
    indexes: { lastMessageTimeStamp: number };
  };
  messages: {
    key: string;
    value: Message;
    indexes: {
      conversationId: string;
      senderId: string;
      timestamp: number;
      type: string;
      parentMessageId: string;
      conversationTimestamp: [string, number]; // compount index
    };
  };
  reactions: {
    key: string;
    value: Reaction;
    indexes: { messageId: string; userId: string };
  };
  attachments: {
    key: string;
    value: Attachment;
    indexes: { messageId: string };
  };
  draftMessages: {
    key: [string, string]; // conversation, userId
    value: DraftMessage;
  };
  sendMessageRequests: {
    key: string;
    value: SendMessageRequest;
    indexes: { status: string; timestamp: number };
  };
}

const DB_NAME = "ChatAppDB";
const DB_VERSION = 1;

async function openDatabase(): Promise<IDBPDatabase<ChatDBSchema>> {
  return openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      const userStore = db.createObjectStore("users", { keyPath: "id" });
      userStore.createIndex("lastSeen", "lastSeen");

      // Conversations store
      const conversationStore = db.createObjectStore("conversations", {
        keyPath: "id",
      });
      conversationStore.createIndex(
        "lastMessageTimeStamp",
        "lastMessageTimeStamp",
      );

      // Messages store
      const messageStore = db.createObjectStore("messages", { keyPath: "id" });
      messageStore.createIndex("conversationId", "conversationId");
      messageStore.createIndex("parentMessageId", "parentMessageId");
      messageStore.createIndex("senderId", "senderId");
      messageStore.createIndex("timestamp", "timestamp");
      messageStore.createIndex("type", "type");
      messageStore.createIndex(
        "conversationTimestamp",
        "conversationTimestamp",
      );

      // Reactions store
      const reactionStore = db.createObjectStore("reactions", {
        keyPath: "id",
      });
      reactionStore.createIndex("messageId", "messageId");
      reactionStore.createIndex("userId", "userId");

      // Attachments store
      const attachmentStore = db.createObjectStore("attachments", {
        keyPath: "id",
      });
      attachmentStore.createIndex("messageId", "messageId");

      // Draft messages store
      db.createObjectStore("draftMessages", {
        keyPath: ["conversationId", "userId"],
      });

      // Send message requests store
      const sendMessageRequestStore = db.createObjectStore(
        "sendMessageRequests",
        { keyPath: "id" },
      );
      sendMessageRequestStore.createIndex("status", "status");
      sendMessageRequestStore.createIndex("timestamp", "timestamp");
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
