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
    
    const onUpdate = (data: any) => {
        if (data.matchId === matchId) {
            setSyncedData((prev) => {
                const newEvents = data.event ? [data.event, ...(prev?.match_events || [])] :
                                  data.last_ball ? [data.last_ball, ...(prev?.match_events || [])] :
                                  prev?.match_events;

                return {
                    ...prev,
                    score_details: data.score || data.scoreDetails || prev?.score_details,
                    match_events: newEvents,
                };
            });
        }
    };
    
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("score_updated", onUpdate);
    socket.on("cricket_score_update", onUpdate);
    
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
      socket.off("score_updated", onUpdate);
      socket.off("cricket_score_update", onUpdate);
    };
  }, [matchId, socket]);

  const sendScore = useCallback((eventName: string, payload: any): Promise<any> => {
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

  return { syncedData, isConnected, sendScore };
};
