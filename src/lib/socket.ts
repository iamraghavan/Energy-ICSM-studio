

import io from "socket.io-client";

const SOCKET_URL = "https://energy-sports-meet-backend.onrender.com";

// New configuration based on the guide
export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Force websocket to bypass polling errors
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("🟢 Live Status: Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 Connection Error:", err.message);
  // Fallback to polling if websocket fails
  if (err.message === "xhr poll error") {
    socket.io.opts.transports = ["polling", "websocket"];
  }
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket Disconnected:", reason);
  if (reason === "io server disconnect") {
    // The disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
});
