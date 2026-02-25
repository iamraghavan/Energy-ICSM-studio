"use client";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  // 1. SSR Guard: Ensure we only run on the browser
  if (typeof window === "undefined") {
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connected: false,
    } as unknown as Socket;
  }
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      // Force WebSocket-only transport to bypass HTTP polling issues.
      transports: ["websocket"],
      path: "/socket.io",
      
      // Resilience settings
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000, 
      
      autoConnect: true,
    });
    
    // Diagnostic logs
    socketInstance.on("connect", () =>
      console.log("🔌 Connected to Backend via WebSocket:", socketInstance?.id),
    );
    socketInstance.on("connect_error", (err) =>
      console.error("❌ Socket Connection Error:", err.message),
    );
     socketInstance.on("disconnect", (reason) => {
        console.warn("⚠️ WebSocket Disconnected:", reason);
    });
  }
  return socketInstance;
};
