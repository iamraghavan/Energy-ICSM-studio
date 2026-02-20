import io from "socket.io-client";

// Initialize Socket (Singleton)
const SOCKET_URL = "https://energy-sports-meet-backend.onrender.com";
export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // 🚀 Force websocket to bypass 502 polling errors on Render
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
});

// Debug Lifecycle Events (Scorer Console)
socket.on("connect", () => {
  console.log("🟢 Live Status: Connected", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 Connection Error:", err.message);
  // Auto-fallback to polling if absolute websocket failure
  if (err.message === "xhr poll error") {
    socket.io.opts.transports = ["polling", "websocket"];
  }
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket Disconnected:", reason);
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
});
