import { ChatDB } from '@/client/db/schema';
import { Message } from '@/client/db/types';
import { DB_STORE_NAMES } from '@/constants';

interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: number;
}

export async function getPaginatedMessages(
  db: ChatDB,
  conversationId: string,
  limit: number = 50,
  cursor?: number,
  direction: 'forward' | 'backward' = 'backward'
): Promise<PaginatedResult<Message>> {
  const tx = db.transaction([DB_STORE_NAMES.MESSAGES], 'readonly');
  const store = tx.objectStore(DB_STORE_NAMES.MESSAGES);
  const index = store.index('byConversationAndTimestamp');

  // Create a key range for the conversation
  const range = IDBKeyRange.bound(
    [conversationId, cursor || 0],
    [conversationId, cursor ? cursor : Date.now()]
  );

  const messages: Message[] = [];
  let hasMore = false;
  let nextCursor: number | undefined;

  let currentCursor = await index.openCursor(
    range, 
    direction === 'backward' ? 'prev' : 'next'
  );

  while (currentCursor && messages.length < limit) {
    messages.push(currentCursor.value);
    currentCursor = await currentCursor.continue();
  }

  if (currentCursor) {
    hasMore = true;
    nextCursor = currentCursor.key[1] as number;
  }

  await tx.done;

  return { items: messages, hasMore, nextCursor };
}

// Helper function to create the compound index when initializing the database
export function createMessageIndexes(store: IDBObjectStore) {
  store.createIndex('byConversationAndTimestamp', ['conversationId', 'timestamp']);
}