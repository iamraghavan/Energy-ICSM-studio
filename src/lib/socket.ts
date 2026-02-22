"use client";

import { io, type Socket } from "socket.io-client";

/**
 * IMPROVED SOCKET.IO CLIENT CONFIGURATION
 * Optimized for Cloud Workstations & Render Deployment.
 */
let socketSingleton: Socket;

function getSocket(): Socket {
    // 1. Server-Side Rendering (SSR) Guard
    if (typeof window === "undefined") {
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
            // Re-allowing polling as the primary transport based on successful test case.
            
            // 🔄 RECONNECTION: Aggressive but controlled
            reconnection: true,
            reconnectionAttempts: Infinity, 
            reconnectionDelay: 2000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
            // ⏱️ TIMEOUTS: Balanced for Render's "Cold Starts"
            timeout: 45000, 
            
            // 🔐 SECURITY: Matches Backend CORS
            withCredentials: true,
            autoConnect: true,
        });

        // --- ENHANCED EVENT LOGGING ---
        socketSingleton.on("connect", () => {
            console.log("%c🟢 WebSocket Connected", "color: #4ade80; font-weight: bold", {
                id: socketSingleton.id,
                url: SOCKET_URL
            });
        });

        socketSingleton.on("connect_error", (err) => {
            console.error("%c🔴 WebSocket Error", "color: #f87171; font-weight: bold", err.message);
            
            if (err.message === "websocket error") {
                console.warn("Possible Proxy/Firewall blockage detected.");
            }
        });

        socketSingleton.on("disconnect", (reason) => {
            console.warn("%c⚠️ WebSocket Disconnected", "color: #fbbf24; font-weight: bold", reason);
            
            // If the server kicked us out manually, try to reconnect
            if (reason === "io server disconnect") {
                socketSingleton.connect();
            }
        });

        // 🛡️ RECOVERY: Log when connection state recovery succeeds
        socketSingleton.on("reconnect", (attempt) => {
            console.log(`♻️ Reconnected after ${attempt} attempts`);
        });
    }

    return socketSingleton;
}

export const socket = getSocket();