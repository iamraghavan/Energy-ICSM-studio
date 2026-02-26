
"use client";
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { getRtDatabase } from '@/lib/firebase';

/**
 * Hook to sync match data from Firebase Realtime Database.
 * Follows the spec for sports/matches/:matchId node.
 */
export const useMatchSync = (matchId: string) => {
  const [matchData, setMatchData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    
    const db = getRtDatabase();
    if (!db) {
        setIsLoading(false);
        return;
    }

    // Path: sports/matches/UUID
    const matchRef = ref(db, `sports/matches/${matchId}`);
    
    const unsubscribe = onValue(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Ensure match_events is always an array for safe mapping
        if (data && data.match_events && !Array.isArray(data.match_events)) {
            data.match_events = Object.values(data.match_events);
        }
        setMatchData(data);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Firebase Sync Error:", err);
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [matchId]);

  return { matchData, isLoading, error };
};
