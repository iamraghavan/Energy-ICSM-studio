
"use client";
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import type { ApiMatch } from "@/lib/api";

export const useMatchSync = (matchId: string) => {
  const socket = getSocket();
  const [syncedData, setSyncedData] = useState<Partial<ApiMatch> | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (!matchId) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    // Generic handler for events that should be added to the timeline
    const handleNewEvent = (eventData: any) => {
        // The server might wrap the event in a 'data' property
        const event = eventData.data || eventData;
        if (event && (event.match_id === matchId || event.matchId === matchId)) {
            setSyncedData((prev) => ({
                ...prev,
                match_events: [event, ...(prev?.match_events || [])]
                    .filter((v, i, a) => a.findIndex(t => (t.id || t.timestamp) === (v.id || v.timestamp)) === i) // basic dedupe
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            }));
        }
    };
    
    // Handler for full score/state updates
    const handleStateUpdate = (data: any) => {
       if (data.matchId === matchId) {
          setSyncedData((prev) => ({
            ...prev,
            status: data.status || prev?.status,
            score_details: data.score || data.scoreDetails || prev?.score_details,
          }));
       }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("score_updated", handleStateUpdate);
    socket.on("cricket_score_update", handleStateUpdate);
    socket.on("event_undone", handleStateUpdate); // It returns the new, corrected score object

    socket.on("card_issued", handleNewEvent);
    socket.on("commentary_added", handleNewEvent);
    
    socket.on("timer_sync", (data) => {
       if (data.matchId === matchId) {
         setSyncedData((prev: any) => ({
            ...prev,
            timer: { action: data.action, currentTime: data.currentTime, timestamp: data.timestamp },
         }));
       }
    });

    
    if (socket.connected) {
        onConnect();
    } else {
        socket.connect();
    }
    socket.emit("join_match", matchId);

    return () => {
      socket.emit("leave_match", matchId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("score_updated", handleStateUpdate);
      socket.off("cricket_score_update", handleStateUpdate);
      socket.off("event_undone", handleStateUpdate);
      socket.off("card_issued", handleNewEvent);
      socket.off("commentary_added", handleNewEvent);
      socket.off("timer_sync");
    };
  }, [matchId, socket]);

  const sendEvent = useCallback((eventName: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket.connected) {
          reject("Not connected to the server.");
          return;
      }
      socket.emit(eventName, { matchId, ...payload }, (response: any) => {
        if (response && response.status === "ok") {
          resolve(response);
        } else {
          reject(response?.message || `Event '${eventName}' failed.`);
        }
      });
    });
  }, [socket, matchId]);

  return { syncedData, isConnected, sendEvent };
};
