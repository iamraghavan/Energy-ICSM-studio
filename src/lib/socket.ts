"use client";
import { io, type Socket } from "socket.io-client";

let socket: Socket;

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

    if (!socket) {
        const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://energy-sports-meet-backend.onrender.com";
        
        socket = io(SOCKET_URL, {
            transports: ["websocket"], // 🚀 FORCE WEBSOCKET (Skips the timeout-prone polling)
            upgrade: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 5000,
            timeout: 60000, // 1 minute for Cold Start waking
            autoConnect: true,
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("🟢 Live Status: Connected", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("🔴 Connection Error:", err.message);
        });

        socket.on("disconnect", (reason) => {
            console.warn("⚠️ Socket Disconnected:", reason);
            if (reason === "io server disconnect") {
                socket.connect();
            }
        });
    }

    return socket;
}

// Export a single, shared instance of the socket
export const socketInstance = getSocket();
