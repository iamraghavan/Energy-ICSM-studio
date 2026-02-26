
"use client";
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import type { ApiMatch } from "@/lib/api";

export const useMatchSocket = (matchId: string, initialMatchData: ApiMatch | null) => {
  const [score, setScore] = useState<any>(initialMatchData?.score_details || null);
  const [matchState, setMatchState] = useState<any>(initialMatchData?.match_state || null);
  const [events, setEvents] = useState<any[]>(Array.isArray(initialMatchData?.match_events) ? initialMatchData.match_events : []);
  const [matchStatus, setMatchStatus] = useState<string>(initialMatchData?.status || 'scheduled');
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();
  
  const processNewEvents = useCallback((newEventData: any | any[]) => {
    if (!newEventData) return;

    setEvents(prev => {
        const currentEvents = Array.isArray(prev) ? prev : [];
        const newEvents = Array.isArray(newEventData) ? newEvents : [newEventData];
        
        // Use ID or timestamp + event_type as a unique key
        const validNewEvents = newEvents.filter(e => e && typeof e === 'object');
        if (validNewEvents.length === 0) return currentEvents;

        const eventKeys = new Set(currentEvents.map(e => e.id || `${e.timestamp}-${e.event_type}`));
        const trulyNewEvents = validNewEvents.filter(e => !eventKeys.has(e.id || `${e.timestamp}-${e.event_type}`));
        
        if (trulyNewEvents.length === 0) return currentEvents;
        
        return [...trulyNewEvents, ...currentEvents].sort((a,b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });
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
        if (data.state) setMatchState(data.state);
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
           if (data.score) setScore(data.score);
           setEvents(prev => Array.isArray(prev) ? prev.filter(e => e.id !== data.undone_event_id) : []);
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
