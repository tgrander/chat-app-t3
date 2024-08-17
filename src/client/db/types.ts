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

  export interface SyncMetadata {
    entity: string;
    lastSyncTimestamp: number;
  }