import { Message, User } from '@/client/db/schema';

// Server Event Types
export type ServerEventName = 
  | 'message_sent'
  | 'message_delivered'
  | 'message_failed'
  | 'message_incoming'
  | 'sync';

// Payloads for each event type
export type MessageSentPayload = {
  messageId: string;
};

export type MessageDeliveredPayload = {
  messageId: string;
};

export type MessageFailedPayload = {
  messageId: string;
};

export type MessageIncomingPayload = {
  message: Message;
  sender: User;
};

export type SyncPayload = {
  // Define the structure of your sync payload here
  // For example:
  lastSyncTimestamp: number;
  // Add any other relevant sync data
};

// Union type for all possible payloads
export type ServerEventPayload =
  | MessageSentPayload
  | MessageDeliveredPayload
  | MessageFailedPayload
  | MessageIncomingPayload
  | SyncPayload;

// The main ServerEvent type
export type ServerEvent = {
  event_name: 'message_sent';
  payload: MessageSentPayload;
} | {
  event_name: 'message_delivered';
  payload: MessageDeliveredPayload;
} | {
  event_name: 'message_failed';
  payload: MessageFailedPayload;
} | {
  event_name: 'message_incoming';
  payload: MessageIncomingPayload;
} | {
  event_name: 'sync';
  payload: SyncPayload;
};

// Realtime event types (for Supabase realtime events)
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeChangePayload<T> {
  commit_timestamp: string;
  eventType: RealtimeEventType;
  new: T;
  old: T | null;
  errors: null | any[];
}

// You might want to define specific payload types for different tables
export type MessageChangePayload = RealtimeChangePayload<Message>;
export type UserChangePayload = RealtimeChangePayload<User>;
// Add more as needed for other types of database changes

// Union type for all possible realtime change payloads
export type RealtimePayload = 
  | MessageChangePayload
  | UserChangePayload;
  // Add more as needed

// Helper type for mapping payloads to event names
export type PayloadEventMap = {
  [K in ServerEventName]: Extract<ServerEvent, { event_name: K }>['payload']
};

// Utility type for extracting payload type from event name
export type PayloadType<T extends ServerEventName> = PayloadEventMap[T];