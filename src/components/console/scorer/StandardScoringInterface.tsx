'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitStandardScore, undoLastBall, type ApiMatch } from "@/lib/api";
import { useMatchSync } from "@/hooks/useMatchSync";
import { ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EndMatchDialog } from './EndMatchDialog';
import { cn } from '@/lib/utils';

export function StandardScoringInterface({ match: initialMatch, onBack }: { match: ApiMatch, onBack: () => void }) {
    const { matchData, isLoading: isSyncing } = useMatchSync(initialMatch.id);
    const [isEndMatchOpen, setIsEndMatchOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    // Priority: Firebase Data > Initial REST Data
    const score = matchData?.score_details || initialMatch.score_details || {};

    const handleScoreEvent = async (teamId: string, points: number) => {
        setIsProcessing(true);
        try {
            await submitStandardScore(initialMatch.id, { 
                points, 
                team_id: teamId, 
                event_type: points > 0 ? 'point' : 'adjustment' 
            });
            toast({ title: "Score Updated" });
        } catch(error) {
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update score.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUndo = async () => {
        setIsProcessing(true);
        try {
            await undoLastBall(initialMatch.id);
            toast({ title: "Last Action Undone" });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Undo Failed' });
        } finally {
            setIsProcessing(false);
        }
    }
    
    const teamAScore = score?.[initialMatch.team_a_id]?.score ?? 0;
    const teamBScore = score?.[initialMatch.team_b_id]?.score ?? 0;

    return (
        <div className="container py-8 max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
                        <div>
                            <CardTitle>Live Scoring: {initialMatch.Sport.name}</CardTitle>
                            <CardDescription>{initialMatch.venue}</CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                             <Badge variant={isSyncing ? "secondary" : "default"} className={!isSyncing ? "bg-green-500" : ""}>{isSyncing ? "Syncing..." : "Real-time"}</Badge>
                             <Button size="sm" variant="destructive" onClick={() => setIsEndMatchOpen(true)}>End Match</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-8">
                        <div className="text-center space-y-4">
                            <Avatar className="mx-auto h-24 w-24 border-4 border-muted"><AvatarFallback className="text-2xl">{initialMatch.TeamA.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                            <h3 className="font-bold text-xl">{initialMatch.TeamA.team_name}</h3>
                            <p className="text-7xl font-black font-mono">{teamAScore}</p>
                            <div className='flex gap-2 justify-center'>
                                <Button size="lg" className="h-16 w-24 text-2xl" disabled={isProcessing} onClick={() => handleScoreEvent(initialMatch.team_a_id, 1)}>+</Button>
                                <Button size="lg" variant="secondary" className="h-16 w-16" disabled={isProcessing} onClick={() => handleScoreEvent(initialMatch.team_a_id, -1)}>-</Button>
                            </div>
                        </div>

                        <p className="text-4xl font-bold text-muted-foreground italic">VS</p>

                        <div className="text-center space-y-4">
                            <Avatar className="mx-auto h-24 w-24 border-4 border-muted"><AvatarFallback className="text-2xl">{initialMatch.TeamB.team_name.substring(0, 2)}</AvatarFallback></Avatar>
                            <h3 className="font-bold text-xl">{initialMatch.TeamB.team_name}</h3>
                            <p className="text-7xl font-black font-mono">{teamBScore}</p>
                             <div className='flex gap-2 justify-center'>
                                <Button size="lg" className="h-16 w-24 text-2xl" disabled={isProcessing} onClick={() => handleScoreEvent(initialMatch.team_b_id, 1)}>+</Button>
                                <Button size="lg" variant="secondary" className="h-16 w-16" disabled={isProcessing} onClick={() => handleScoreEvent(initialMatch.team_b_id, -1)}>-</Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8 border-t">
                        <Button variant="outline" size="lg" onClick={handleUndo} disabled={isProcessing} className="gap-2">
                            {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <RotateCcw className="w-5 h-5" />}
                            Undo Last Action
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <EndMatchDialog 
                isOpen={isEndMatchOpen}
                onClose={() => setIsEndMatchOpen(false)}
                match={initialMatch}
                onEndMatch={onBack}
            />
        </div>
    );
}
