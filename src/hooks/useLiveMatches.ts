'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Robust SSE hook for live match updates.
 * Handles automatic reconnection, parse errors, and status tracking.
 */
export const useLiveMatches = (sportId?: string | number) => {
    const [matches, setMatches] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const baseUrl = 'https://energy-sports-meet-backend.vercel.app/api/v1/matches/live';
        const url = `${baseUrl}?stream=true${sportId ? `&sportId=${sportId}` : ''}`;
        
        const es = new EventSource(url);

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMatches(data);
                setError(null);
                setIsLoading(false);
            } catch (err) {
                console.log("SSE Parse Error:", err);
            }
        };

        es.onerror = (err) => {
            // Using console.log to avoid dev overlay noise for transient connection drops
            console.log("SSE Connection Status: Link lost or handshake in progress. Retrying in 5s...", err);
            setError("Link interrupted. Reconnecting...");
            setIsLoading(false);
            es.close();
            
            // Clean up old timeout and try again in 5 seconds
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        eventSourceRef.current = es;
    };

    useEffect(() => {
        connect();
        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [sportId]);

    return { matches, error, isLoading };
};
