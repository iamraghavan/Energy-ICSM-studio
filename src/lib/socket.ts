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
      // 🚀 SUCCESS CONFIG: Start with polling, then upgrade to WebSocket.
      // This is critical for passing through cloud firewalls/proxies.
      transports: ["polling", "websocket"],
      
      // ⏱️ RESILIENCE: High timeouts for Render "Cold Starts"
      timeout: 60000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      
      autoConnect: true,
      withCredentials: true,
    });
    // Diagnostic logs
    socketInstance.on("connect", () =>
      console.log("🔌 Connected to Backend:", socketInstance?.id),
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
