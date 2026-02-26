
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type ApiMatch } from "@/lib/api";
import { ArrowLeft, Goal, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMatchSocket } from '@/hooks/useMatchSocket';
import { EndMatchDialog } from './EndMatchDialog';
import { cn } from '@/lib/utils';

export function StandardScoringInterface({ match, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { score: liveScore, submitAction, isConnected } = useMatchSocket(match.id);
    
    const [isEndMatchOpen, setIsEndMatchOpen] = useState(false);
    const { toast } = useToast();

    const score = liveScore || match.score_details || {};

    const handleScoreEvent = async (teamId: string, points: number) => {
        try {
            await submitAction("submit_standard_score", { points, team_id: teamId, event_type: 'point' });
            toast({ title: "Point Synced!", description: `${points > 0 ? `+${points}`: points} point recorded.` });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Sync Error', description: String(error) });
        }
    };

    const handleUndo = async () => {
        try {
            await submitAction('undo_event', {});
            toast({ title: "Last Action Undone" });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed' });
        }
    }
    
    const teamAScore = score?.[match.team_a_id]?.score ?? 0;
    const teamBScore = score?.[match.team_b_id]?.score ?? 0;

    return (
        <div className="container py-8 max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
                        <div>
                            <CardTitle>Live Scoring: {match.Sport.name}</CardTitle>
                            <CardDescription>{match.venue}</CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                             <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>{isConnected ? "Connected" : "Offline"}</Badge>
                             <Button size="sm" variant="destructive" onClick={() => setIsEndMatchOpen(true)}>End Match</Button>
                        </div>
                    </div>
                </header>
                <CardContent className="space-y-8 pt-6">
                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-8">
                        <div className="text-center space-y-4">
                            <Avatar className="mx-auto h-24 w-24 border-4 border-muted"><AvatarFallback className="text-2xl">{match.TeamA.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                            <h3 className="font-bold text-xl">{match.TeamA.team_name}</h3>
                            <p className="text-7xl font-black font-mono">{teamAScore}</p>
                            <div className='flex gap-2 justify-center'>
                                <Button size="lg" className="h-16 w-24 text-2xl" onClick={() => handleScoreEvent(match.team_a_id, 1)}>+1</Button>
                                <Button size="lg" variant="secondary" className="h-16 w-16" onClick={() => handleScoreEvent(match.team_a_id, -1)}>-1</Button>
                            </div>
                        </div>

                        <p className="text-4xl font-bold text-muted-foreground italic">VS</p>

                        <div className="text-center space-y-4">
                            <Avatar className="mx-auto h-24 w-24 border-4 border-muted"><AvatarFallback className="text-2xl">{match.TeamB.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                            <h3 className="font-bold text-xl">{match.TeamB.team_name}</h3>
                            <p className="text-7xl font-black font-mono">{teamBScore}</p>
                             <div className='flex gap-2 justify-center'>
                                <Button size="lg" className="h-16 w-24 text-2xl" onClick={() => handleScoreEvent(match.team_b_id, 1)}>+1</Button>
                                <Button size="lg" variant="secondary" className="h-16 w-16" onClick={() => handleScoreEvent(match.team_b_id, -1)}>-1</Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8 border-t">
                        <Button variant="outline" size="lg" onClick={handleUndo} className="gap-2">
                            <RotateCcw className="w-5 h-5" />
                            Undo Last Event
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <EndMatchDialog 
                isOpen={isEndMatchOpen}
                onClose={() => setIsEndMatchOpen(false)}
                match={match}
                onEndMatch={onBack}
            />
        </div>
    );
}
