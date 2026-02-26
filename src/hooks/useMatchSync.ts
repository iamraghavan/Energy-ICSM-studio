"use client";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export const useMatchSync = (matchId: string) => {
  const [matchData, setMatchData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    // Path: sports/matches/UUID
    const matchRef = ref(database, `sports/matches/${matchId}`);

    const unsubscribe = onValue(
      matchRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMatchData(snapshot.val());
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Firebase RTDB Sync Error:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [matchId]);

  return { matchData, isLoading, error };
};
