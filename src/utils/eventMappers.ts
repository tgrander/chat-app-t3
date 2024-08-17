import type { Message, User } from '@/client/db/types';

import type { ServerEvent } from '@/types/events';
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Payload = RealtimePostgresChangesPayload<{ [key: string]: any; }>

export function mapPayloadToServerEvent(payload: Payload): ServerEvent | null {
  console.log('Mapping payload to server event:', payload);

  switch (payload.eventType) {
    case 'INSERT':
      return handleInsertEvent(payload);
    case 'UPDATE':
      return handleUpdateEvent(payload);
    case 'DELETE':
      return handleDeleteEvent(payload);
    default:
      console.warn('Unknown event type:', payload);
      return null;
  }
}

function handleInsertEvent(payload: Payload): ServerEvent | null {
  if (isMessagePayload(payload)) {
    return {
      event_name: 'message_incoming',
      payload: {
        message: mapDatabaseMessageToMessage(payload.new),
      },
    };
  }
  // Handle other insert events if necessary
  return null;
}

function handleUpdateEvent(payload: Payload): ServerEvent | null {
  if (isMessagePayload(payload)) {
    const newMessage = mapDatabaseMessageToMessage(payload.new);
    
    switch (newMessage.status) {
      case 'sent':
        return {
          event_name: 'message_sent',
          payload: { messageId: newMessage.id },
        };
      case 'delivered':
        return {
          event_name: 'message_delivered',
          payload: { messageId: newMessage.id },
        };
      case 'failed':
        return {
          event_name: 'message_failed',
          payload: { messageId: newMessage.id },
        };
    }
  }
  // Handle other update events if necessary
  return null;
}

function handleDeleteEvent(payload: Payload): ServerEvent | null {
  // Handle delete events if necessary
  return null;
}

function isMessagePayload(payload: Payload): payload is RealtimePostgresChangesPayload<Message> {
  return 'content' in payload.new;
}

function isUserPayload(payload: Payload): payload is RealtimePostgresChangesPayload<User> {
  return 'name' in payload.new;
}

function mapDatabaseMessageToMessage(dbMessage: any): Message {
  return {
    id: dbMessage.id,
    conversationId: dbMessage.conversation_id,
    senderId: dbMessage.sender_id,
    type: dbMessage.type,
    status: dbMessage.status,
    timestamp: dbMessage.timestamp,
    parentMessageId: dbMessage.parent_message_id || null,
    version: dbMessage.version || 1,
    createdAt: dbMessage.created_at,
    updatedAt: dbMessage.updated_at,
  };
}

function mapDatabaseUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    status: dbUser.status,
    lastSeen: dbUser.last_seen,
    createdAt: dbUser.created_at,
  };
}

export function mapMessageToServerFormat(message: Message): any {
  return {
    id: message.id,
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    type: message.type,
    status: message.status,
    timestamp: message.timestamp,
    parent_message_id: message.parentMessageId,
    version: message.version,
    created_at: message.createdAt,
    updated_at: message.updatedAt,
  };
}

export function mapUserToServerFormat(user: User): any {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    status: user.status,
    last_seen: user.lastSeen,
    created_at: user.createdAt,
  };
}