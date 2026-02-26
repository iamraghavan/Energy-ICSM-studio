
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
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('student_token');
    
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token: token
      },
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
// 01