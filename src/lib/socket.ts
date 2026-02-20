import { io, type Socket } from "socket.io-client";

// Initialize Socket (Singleton)
const SOCKET_URL = "https://energy-sports-meet-backend.onrender.com";
export const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"], // 🚀 CRITICAL: Force WebSocket to bypass polling timeouts
  upgrade: false, // Prevents trying to "upgrade" from polling
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 5000, // Increased delay
  timeout: 60000, // Increased timeout for cold starts (1 minute)
});

// Debug Lifecycle Events (Scorer Console)
socket.on("connect", () => {
  console.log("🟢 Live Status: Connected", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 Connection Error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket Disconnected:", reason);
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
});
