
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { ApiMatch } from "@/lib/api";

export const useMatchSocket = (matchId: string, initialMatchData: ApiMatch | null = null) => {
  const [score, setScore] = useState<any>(initialMatchData?.score_details || null);
  const [matchState, setMatchState] = useState<any>(initialMatchData?.match_state || null);
  const [events, setEvents] = useState<any[]>(Array.isArray(initialMatchData?.match_events) ? initialMatchData.match_events : []);
  const [matchStatus, setMatchStatus] = useState<string>(initialMatchData?.status || 'scheduled');
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  // Helper to process and merge incoming events without duplicates
  const processNewEvents = useCallback((newEventData: any | any[]) => {
    if (!newEventData) return;

    setEvents(prev => {
        const currentEvents = Array.isArray(prev) ? prev : [];
        const incoming = Array.isArray(newEventData) ? newEventData : [newEventData];
        
        // Filter out nulls/invalid objects
        const validNewEvents = incoming.filter(e => e && typeof e === 'object');
        if (validNewEvents.length === 0) return currentEvents;

        // Use a composite key for deduplication if 'id' is missing
        const eventKeys = new Set(currentEvents.map(e => e.id || `${e.timestamp}-${e.event_type}`));
        const trulyNewEvents = validNewEvents.filter(e => !eventKeys.has(e.id || `${e.timestamp}-${e.event_type}`));
        
        if (trulyNewEvents.length === 0) return currentEvents;
        
        // Prepend new events and sort by timestamp descending
        const merged = [...trulyNewEvents, ...currentEvents];
        return merged.sort((a,b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });
    });
  }, []);

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
        if (data.event) processNewEvents(data.event);
      }
    };

    const onCricketUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setScore(data.score || data.scoreDetails);
        if (data.last_ball) processNewEvents(data.last_ball);
        if (data.state) setMatchState(data.state);
      }
    };

    const onStateUpdate = (data: any) => {
      if (data.matchId === matchId) setMatchState(data.state);
    };

    const onEventUndone = (data: any) => {
        if (data.matchId === matchId) {
            setScore(data.score);
            setEvents(prev => Array.isArray(prev) ? prev.filter(e => e.id !== data.undone_event_id) : []);
        }
    };

    const onStatusUpdate = (data: any) => {
        if (data.matchId === matchId) setMatchStatus(data.status);
    };

    if (socket.connected) onConnect();
    
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("cricket_score_update", onCricketUpdate);
    socket.on("score_updated", onScoreUpdate);
    socket.on("match_state_updated", onStateUpdate);
    socket.on("event_undone", onEventUndone);
    socket.on('match_status_change', onStatusUpdate);

    return () => {
      socket.emit("leave_match", matchId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("cricket_score_update", onCricketUpdate);
      socket.off("score_updated", onScoreUpdate);
      socket.off("match_state_updated", onStateUpdate);
      socket.off("event_undone", onEventUndone);
      socket.off('match_status_change', onStatusUpdate);
    };
  }, [matchId, socket, processNewEvents]);

  const submitAction = (eventName: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.connected) return reject("Socket not connected");
      socket.emit(eventName, { matchId, ...payload }, (ack: any) => {
        if (ack && ack.status === "ok") resolve(ack);
        else reject(ack?.message || "Action failed");
      });
    });
  };

  return { score, matchState, isConnected, submitAction, events, matchStatus };
};
