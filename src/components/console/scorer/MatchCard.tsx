
'use client';
import type { ApiMatch } from "@/lib/api";
import { format } from 'date-fns';
import { Calendar, Clapperboard, MapPin, Trophy, Users, PlayCircle, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TossDialog } from "./TossDialog";
import { LineupDialog } from "./LineupDialog";

export function MatchCard({ match, onUpdate }: { match: ApiMatch, onUpdate: () => void }) {
    const router = useRouter();
    const [isTossOpen, setIsTossOpen] = useState(false);
    const [isLineupOpen, setIsLineupOpen] = useState(false);

    const handleScoreClick = () => {
        router.push(`/console/scorer/live/${match.id}`);
    }

    const teamAScore = match.score_details?.[match.team_a_id]?.score ?? match.score_details?.[match.team_a_id]?.runs ?? 0;
    const teamBScore = match.score_details?.[match.team_b_id]?.score ?? match.score_details?.[match.team_b_id]?.runs ?? 0;

    return (
        <>
            <div className="border p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                         <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'} className="capitalize">{match.status}</Badge>
                         <p className="font-bold text-lg">{match.TeamA.team_name} vs {match.TeamB.team_name}</p>
                    </div>
                    
                    {(match.status === 'live' || match.status === 'completed') && (
                        <div className="bg-muted px-3 py-1 rounded-md w-fit flex gap-4 text-xl font-mono font-bold">
                            <span>{teamAScore}</span>
                            <span className="text-muted-foreground">-</span>
                            <span>{teamBScore}</span>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Trophy className="w-4 h-4" /><span>{match.Sport.name}</span></div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{format(new Date(match.start_time), 'PPP p')}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{match.venue}</span></div>
                    </div>
                </div>
                <div className="ml-auto shrink-0 flex items-center gap-2">
                     {match.status === 'scheduled' && (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setIsLineupOpen(true)}><Users className="mr-2"/>Lineup</Button>
                            <Button variant="secondary" size="sm" onClick={() => setIsTossOpen(true)} className="bg-green-600 hover:bg-green-700 text-white animate-pulse"><PlayCircle className="mr-2"/> Go Live</Button>
                        </>
                    )}
                    {match.status === 'live' && (
                        <Button onClick={handleScoreClick}><Clapperboard className="mr-2"/>Score Match</Button>
                    )}
                    {match.status === 'completed' && (
                        <Button variant="ghost" size="sm"><BarChart className="mr-2"/>View Stats</Button>
                    )}
                </div>
            </div>
            {match.status === 'scheduled' && (
                 <TossDialog
                    isOpen={isTossOpen}
                    onClose={() => setIsTossOpen(false)}
                    match={match}
                    onTossDecided={onUpdate}
                />
            )}
             <LineupDialog
                isOpen={isLineupOpen}
                onClose={() => setIsLineupOpen(false)}
                match={match}
            />
        </>
    )
}
