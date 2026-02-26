
"use client";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://energy-sports-meet-backend.onrender.com";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
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
      transports: ["polling", "websocket"],
      timeout: 60000,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      path: "/socket.io",
      autoConnect: true,
      withCredentials: true,
    });

    socketInstance.on("connect", () =>
      console.log("🔌 Connected to Backend:", socketInstance?.id),
    );

    socketInstance.on("connect_error", (err) =>
      console.error("❌ Socket Error:", err.message),
    );

    socketInstance.on("disconnect", (reason) => {
        console.warn("⚠️ WebSocket Disconnected:", reason);
    });
  }
  return socketInstance;
};
