
"use client";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export const useMatchSocket = (matchId: string) => {
  const [score, setScore] = useState<any>(null);
  const [matchState, setMatchState] = useState<any>(null); // Striker, Bowler, etc.
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();
  
  useEffect(() => {
    if (!matchId) return;
    // 1. Join the Room
    socket.emit("join_match", matchId);
    setIsConnected(socket.connected);
    
    // 2. Listeners
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    // Live Score Updates
    const onScoreUpdate = (data: any) => {
      if (data.matchId === matchId) setScore(data.score || data.scoreDetails);
    };
    // Live State Updates (Striker/Bowler changes)
    const onStateUpdate = (data: any) => {
      if (data.matchId === matchId) setMatchState(data.state);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("cricket_score_update", onScoreUpdate);
    socket.on("score_updated", onScoreUpdate);
    socket.on("match_state_updated", onStateUpdate); // <--- NEW
    
    // 3. Cleanup
    return () => {
      socket.emit("leave_match", matchId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("cricket_score_update", onScoreUpdate);
      socket.off("score_updated", onScoreUpdate);
      socket.off("match_state_updated", onStateUpdate);
    };
  }, [matchId, socket]);

  /**
   * Universal Helper to send any action (Score, State, Timer)
   */
  const submitAction = (eventName: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.connected) return reject("Socket not connected");
      
      socket.emit(eventName, { matchId, ...payload }, (ack: any) => {
        if (ack && ack.status === "ok") resolve(ack);
        else reject(ack?.message || "Action failed");
      });
    });
  };

  return { score, matchState, isConnected, submitAction };
};

// Kept for compatibility with other components that might still use it.
// Consider refactoring them to use useMatchSocket.
export const useMatchSync = (matchId: string) => {
    const { score, matchState, isConnected, submitAction } = useMatchSocket(matchId);
    const syncedData = {
        score_details: score,
        match_state: matchState,
    };
    return { syncedData, isConnected, sendEvent: submitAction };
}
