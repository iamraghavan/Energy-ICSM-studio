import io from "socket.io-client";

const SOCKET_URL = "https://energy-sports-meet-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  secure: true,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
});

// Debug Lifecycle Events
socket.on("connect", () => {
  console.log("🟢 Live Status: Connected:", socket.id);
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
