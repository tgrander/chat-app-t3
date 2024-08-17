// Database and Sync Constants
export const DB_NAME = 'ChatAppDB';
export const DB_VERSION = 1;
export const SYNC_BATCH_SIZE = 100;
export const MAX_RETRY_ATTEMPTS = 3;
export const SYNC_INTERVAL = 60000; // 1 minute in milliseconds

// Message Constants
export const MAX_MESSAGE_LENGTH = 2000;
export const MESSAGE_FETCH_LIMIT = 50;

// User Status Constants
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
} as const;

// Message Status Constants
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

// Message Type Constants
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const;

// IndexedDB Store Names
export const DB_STORE_NAMES = {
  USERS: 'chat_users',
  CONVERSATIONS: 'chat_conversations',
  MESSAGES: 'chat_messages',
  TEXT_MESSAGES: 'chat_text_messages',
  MEDIA_MESSAGES: 'chat_media_messages',
  FILE_MESSAGES: 'chat_file_messages',
  REACTIONS: 'chat_reactions',
  CONVERSATION_PARTICIPANTS: 'chat_conversation_participants',
  SEND_MESSAGE_REQUESTS: 'chat_send_message_request',
  SYNC_METADATA: 'sync_metadata',
  DRAFT_MESSAGES: 'chat_draft_messages'
} as const;

// Supabase Table Names
export const SUPABASE_TABLES = {
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
} as const;

// Timeouts and Intervals
export const CONNECTION_TIMEOUT = 10000; // 10 seconds
export const RETRY_INTERVAL = 5000; // 5 seconds

// UI Constants
export const TOAST_DURATION = 3000; // 3 seconds
export const MAX_AVATAR_SIZE = 1024 * 1024; // 1MB

// Feature Flags
export const ENABLE_OFFLINE_MODE = true;
export const ENABLE_MESSAGE_ENCRYPTION = false;
export const ENABLE_READ_RECEIPTS = true;

// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';

// Regex Patterns
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_INPUT: 'Invalid input. Please check your data and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;