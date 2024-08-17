import { useCallback, useEffect, useState } from 'react';

import { ChatDB } from '@/client/db/schema';
import { useSupabaseClient } from '@/context/supabase/client';
import { useInitDatabase } from '@/hooks/db';
import { setupRealtimeChannel } from '@/services/realtime';
import { syncWithServer } from '@/services/sync';

export function useDataSyncer() {
  const supabase = useSupabaseClient();
  const { db, error: dbError } = useInitDatabase();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleConnectionStatus = useCallback((status: boolean) => {
    setIsConnected(status);
  }, []);

  const handleSyncError = useCallback((syncError: unknown) => {
    console.error("Sync failed:", syncError);
    setError(syncError instanceof Error ? syncError : new Error("Sync failed"));
  }, []);

  // Subscribe to real-time event channel
  useEffect(() => {
    if (!db) return;
    const { unsubscribe, error: channelError } = setupRealtimeChannel(supabase, db, handleConnectionStatus);
    
    if (channelError) {
      setError(channelError);
    }
    // Cleanup
    return unsubscribe;
  }, [db, supabase, handleConnectionStatus]);

  // 
  useEffect(() => {
    let isMounted = true;

    const performSync = async (db: ChatDB) => {
      try {
        await syncWithServer(db, supabase);
      } catch (syncError) {
        if (isMounted) {
          handleSyncError(syncError);
        }
      }
    };

    if (isConnected && db) {
      performSync(db);
    }

    return () => {
      isMounted = false;
    };
  }, [isConnected, db, supabase, handleSyncError]);

  return { 
    isConnected, 
    error: error || dbError,
    db 
  };
}