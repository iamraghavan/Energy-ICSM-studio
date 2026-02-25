
"use client";
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import type { ApiMatch } from "@/lib/api";

export const useMatchSocket = (matchId: string, initialMatchData: ApiMatch | null) => {
  const [score, setScore] = useState<any>(initialMatchData?.score_details || null);
  const [matchState, setMatchState] = useState<any>(initialMatchData?.match_state || null);
  const [events, setEvents] = useState<any[]>(initialMatchData?.match_events || []);
  const [matchStatus, setMatchStatus] = useState<string>(initialMatchData?.status || 'scheduled');
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();
  
  const processNewEvents = useCallback((newEventData: any | any[]) => {
    setEvents(prev => {
        const newEvents = Array.isArray(newEventData) ? newEventData : [newEventData];
        const eventIds = new Set(prev.map(e => e.id));
        const trulyNewEvents = newEvents.filter(e => e && !eventIds.has(e.id));
        if (trulyNewEvents.length === 0) return prev;
        return [...trulyNewEvents, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("join_match", matchId);
    };

    const handleDisconnect = () => setIsConnected(false);

    const handleScoreUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setScore(data.score || data.scoreDetails);
        if(data.event) processNewEvents(data.event);
      }
    };
    
    const handleCricketUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setScore(data.score || data.scoreDetails);
        if (data.last_ball) processNewEvents(data.last_ball);
      }
    };
    
    const handleStateUpdate = (data: any) => {
      if (data.matchId === matchId) setMatchState(data.state);
    };

    const handleNewEvent = (data: any) => {
       if (data.matchId === matchId) processNewEvents(data.event);
    };

    const handleEventUndone = (data: any) => {
       if (data.matchId === matchId) {
           setScore(data.score);
           // Refetch events for simplicity after undo
           // Or more advanced: find and remove event from local state
           setEvents(prev => prev.filter(e => e.id !== data.undone_event_id));
       }
    };

    const handleStatusUpdate = (data: any) => {
        if (data.matchId === matchId) setMatchStatus(data.status);
    }

    if (socket.connected) {
        handleConnect();
    }
    
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("score_updated", handleScoreUpdate);
    socket.on("cricket_score_update", handleCricketUpdate);
    socket.on("match_state_updated", handleStateUpdate);
    socket.on("card_issued", handleNewEvent);
    socket.on("commentary_added", handleNewEvent);
    socket.on("event_undone", handleEventUndone);
    socket.on('match_status_change', handleStatusUpdate);

    return () => {
      socket.emit("leave_match", matchId);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("score_updated", handleScoreUpdate);
      socket.off("cricket_score_update", handleCricketUpdate);
      socket.off("match_state_updated", handleStateUpdate);
      socket.off("card_issued", handleNewEvent);
      socket.off("commentary_added", handleNewEvent);
      socket.off("event_undone", handleEventUndone);
      socket.off('match_status_change', handleStatusUpdate);
    };
  }, [matchId, socket, processNewEvents]);

  const submitAction = useCallback((eventName: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
        console.error("Socket not connected, cannot emit:", eventName);
        return reject("Socket not connected");
      }
      socket.emit(eventName, { matchId, ...payload }, (ack: any) => {
        if (ack && ack.status === "ok") resolve(ack);
        else reject(ack?.message || `Action failed: ${eventName}`);
      });
    });
  }, [socket, matchId]);

  return { score, matchState, isConnected, submitAction, events, matchStatus };
};
