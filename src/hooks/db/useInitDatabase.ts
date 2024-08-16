import { useEffect, useState } from "react";

import { initDatabase, type ChatDBSchema } from "@/client/db/schema";
import { type IDBPDatabase } from "idb";

/**
 * React hook that initializes the local DB connection (IndexedDB)
 */
export function useInitDatabase() {
  const [db, setDb] = useState<IDBPDatabase<ChatDBSchema> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initDB() {
      try {
        const database = await initDatabase();
        setDb(database);
      } catch (error) {
        setError(error as Error);
      }
    }

    initDB();

    return () => {
      db?.close();
    };
  }, []);

  return { db, error };
}
