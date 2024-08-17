import { ChatDB } from '@/client/db/schema';

import { Conversation } from '@/client/db/types';
import { DB_STORE_NAMES } from '@/constants';

interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: number;
}

export async function getPaginatedConversations(
  db: ChatDB,
  limit: number = 20,
  cursor?: number,
  direction: 'forward' | 'backward' = 'backward'
): Promise<PaginatedResult<Conversation>> {
  const tx = db.transaction([DB_STORE_NAMES.CONVERSATIONS], 'readonly');
  const store = tx.objectStore(DB_STORE_NAMES.CONVERSATIONS);
  const index = store.index('lastMessageTimestamp');

  // Create a key range
  const range = cursor
    ? IDBKeyRange.upperBound(cursor, true)
    : undefined;

  const conversations: Conversation[] = [];
  let hasMore = false;
  let nextCursor: number | undefined;

  let currentCursor = await index.openCursor(
    range,
    direction === 'backward' ? 'prev' : 'next'
  );

  while (currentCursor && conversations.length < limit) {
    conversations.push(currentCursor.value);
    currentCursor = await currentCursor.continue();
  }

  if (currentCursor) {
    hasMore = true;
    nextCursor = currentCursor.key as number;
  }

  await tx.done;

  return { items: conversations, hasMore, nextCursor };
}

// Usage example
export async function loadConversations(db: ChatDB, lastCursor?: number) {
  try {
    const result = await getPaginatedConversations(db, 20, lastCursor);
    // Handle the result
    console.log('Conversations:', result.items);
    console.log('Has more:', result.hasMore);
    console.log('Next cursor:', result.nextCursor);
  } catch (error) {
    console.error('Error fetching conversations:', error);
  }
}