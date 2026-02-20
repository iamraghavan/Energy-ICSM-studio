

import io from "socket.io-client";

const SOCKET_URL = "https://energy-sports-meet-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  secure: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("🟢 Live Status: Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 Connection Error:", err.message);
  if (err.message === "xhr poll error") {
    socket.io.opts.transports = ["polling", "websocket"];
  }
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket Disconnected:", reason);
  if (reason === "io server disconnect") {
    socket.connect();
  }
});
