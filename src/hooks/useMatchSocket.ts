
"use client";
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import type { ApiMatch } from "@/lib/api";

export const useMatchSocket = (matchId: string, initialMatchData: ApiMatch | null = null) => {
  const [score, setScore] = useState<any>(initialMatchData?.score_details || null);
  const [matchState, setMatchState] = useState<any>(initialMatchData?.match_state || null);
  const [events, setEvents] = useState<any[]>(initialMatchData?.match_events || []);
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (!matchId) return;

    const onConnect = () => {
      setIsConnected(true);
      socket.emit("join_match", matchId);
    };

    const onDisconnect = () => setIsConnected(false);

    const onScoreUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setScore(data.score || data.scoreDetails);
        if (data.event) {
            setEvents(prev => [data.event, ...prev]);
        }
      }
    };

    const onCricketUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setScore(data.score || data.scoreDetails);
        if (data.last_ball) {
            setEvents(prev => [data.last_ball, ...prev]);
        }
      }
    };

    const onStateUpdate = (data: any) => {
      if (data.matchId === matchId) setMatchState(data.state);
    };

    const onEventUndone = (data: any) => {
        if (data.matchId === matchId) {
            setScore(data.score);
            setEvents(prev => prev.filter(e => e.id !== data.undone_event_id));
        }
    };

    if (socket.connected) onConnect();
    
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("cricket_score_update", onCricketUpdate);
    socket.on("score_updated", onScoreUpdate);
    socket.on("match_state_updated", onStateUpdate);
    socket.on("event_undone", onEventUndone);

    return () => {
      socket.emit("leave_match", matchId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("cricket_score_update", onCricketUpdate);
      socket.off("score_updated", onScoreUpdate);
      socket.off("match_state_updated", onStateUpdate);
      socket.off("event_undone", onEventUndone);
    };
  }, [matchId, socket]);

  const submitAction = (eventName: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.connected) return reject("Socket not connected");
      socket.emit(eventName, { matchId, ...payload }, (ack: any) => {
        if (ack && ack.status === "ok") resolve(ack);
        else reject(ack?.message || "Action failed");
      });
    });
  };

  return { score, matchState, isConnected, submitAction, events };
};
