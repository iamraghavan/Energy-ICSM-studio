'use client';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { io } from 'socket.io-client';

const API_URL = 'https://energy-sports-meet-backend.onrender.com';

export function ScorerDashboard() {

    useEffect(() => {
        const socket = io(API_URL);

        // Example for a specific match
        const matchId = 'some-match-id'; // This would be dynamic
        socket.emit('join_match', matchId);
    
        socket.on('score_updated', (data) => {
            console.log('Score updated:', data);
            // Update UI with new score data
        });
    
        return () => {
            socket.disconnect();
        };
    }, []);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Scorer Dashboard</CardTitle>
                <CardDescription>Live Score Entry and Match Management</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is where the live scoring interface will be. Socket.io connection is active for real-time updates.</p>
                 <p className="mt-4">Components to render here:</p>
                 <ul className="list-disc pl-5 mt-2 text-muted-foreground">
                    <li>&lt;LiveScoring /&gt;</li>
                    <li>&lt;MatchScheduler /&gt;</li>
                    <li>&lt;LineupManager /&gt;</li>
                </ul>
            </CardContent>
        </Card>
    );
}
