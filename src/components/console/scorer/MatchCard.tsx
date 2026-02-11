'use client';
import type { Fixture } from "@/lib/types";
import { teams, sports } from "@/lib/data";
import { format } from 'date-fns';
import { Calendar, MapPin } from "lucide-react";

const getTeam = (id: string) => teams.find(t => t.id === id);
const getSport = (id: string) => sports.find(s => s.id === id);

export function MatchCard({ fixture, children }: { fixture: Fixture, children?: React.ReactNode }) {
    const teamA = getTeam(fixture.teamAId);
    const teamB = getTeam(fixture.teamBId);
    const sport = getSport(fixture.sportId);

    if (!teamA || !teamB || !sport) return null;
    
    return (
        <div className="border p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/50">
            <div className="flex-1 space-y-1">
                <p className="font-bold text-lg">{teamA.name} vs {teamB.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <sport.icon className="w-4 h-4" />
                        <span>{sport.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(fixture.dateTime, 'PPP p')}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{fixture.venue}</span>
                    </div>
                </div>
            </div>
            {children && <div className="ml-auto shrink-0">{children}</div>}
        </div>
    )
}
