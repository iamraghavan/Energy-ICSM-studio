'use client';
import type { ApiMatch } from "@/lib/api";
import { format } from 'date-fns';
import { Calendar, MapPin, Trophy } from "lucide-react"; // Using Trophy as a generic sport icon

export function MatchCard({ match, children }: { match: ApiMatch, children?: React.ReactNode }) {
    
    return (
        <div className="border p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/50">
            <div className="flex-1 space-y-1">
                <p className="font-bold text-lg">{match.TeamA.team_name} vs {match.TeamB.team_name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        <span>{match.Sport.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(match.start_time), 'PPP p')}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{match.venue}</span>
                    </div>
                </div>
            </div>
            {children && <div className="ml-auto shrink-0">{children}</div>}
        </div>
    )
}
