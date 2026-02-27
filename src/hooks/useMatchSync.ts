
"use client";
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { getRtDatabase } from '@/lib/firebase';

/**
 * Hook to sync match data from Firebase Realtime Database.
 * Establishes a direct connection to the match node.
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
        
        // Defensive data normalization
        if (data) {
            // Convert history object to sorted array
            if (data.match_history && !Array.isArray(data.match_history)) {
                data.match_history = Object.values(data.match_history).sort((a: any, b: any) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
            }
            
            // Ensure mandatory objects exist to prevent crashes
            data.score_details = data.score_details || {};
            data.match_state = data.match_state || {};
            data.current_batsmen_stats = data.current_batsmen_stats || {};
            data.current_bowler_stats = data.current_bowler_stats || {};
        }
        
        setMatchData(data);
      } else {
        setMatchData(null);
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
