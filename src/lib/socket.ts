
import io from "socket.io-client";

const SOCKET_URL = "https://energy-sports-meet-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],
  secure: true,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  timeout: 20000,
  autoConnect: true
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket Connection Error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket Disconnected:", reason);
  if (reason === "io server disconnect") {
    socket.connect();
  }
});
