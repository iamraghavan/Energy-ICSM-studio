"use client";
import { io, type Socket } from "socket.io-client";

let socketSingleton: Socket;

// This function should not be exported or used directly from other modules
function getSocket(): Socket {
    if (typeof window === "undefined") {
        // On the server, return a dummy object that won't try to connect
        return {
            on: () => {},
            off: () => {},
            emit: () => {},
            connected: false,
        } as unknown as Socket;
    }

    if (!socketSingleton) {
        const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://energy-sports-meet-backend.onrender.com";
        
        socketSingleton = io(SOCKET_URL, {
            transports: ["websocket"], // 🚀 CRITICAL: Force WebSocket
            upgrade: false,
            reconnection: true,
            reconnectionAttempts: Infinity, // More robust for live scoring
            reconnectionDelay: 5000,
            timeout: 60000,           // Give it 1 minute for "Cold Starts"
            autoConnect: true,
            withCredentials: true,
        });

        socketSingleton.on("connect", () => {
            console.log("🟢 Live Status: Connected", socketSingleton.id);
        });

        socketSingleton.on("connect_error", (err) => {
            console.error("🔴 Connection Error:", err.message);
             if (err.message === "xhr poll error") {
                socketSingleton.io.opts.transports = ["polling", "websocket"];
            }
        });

        socketSingleton.on("disconnect", (reason) => {
            console.warn("⚠️ Socket Disconnected:", reason);
            if (reason === "io server disconnect") {
                socketSingleton.connect();
            }
        });
    }

    return socketSingleton;
}

// Export a single, shared instance of the socket
export const socket = getSocket();
