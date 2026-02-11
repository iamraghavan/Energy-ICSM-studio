'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatchesBySport, getLiveMatches, getLineup, manageLineup, type ApiMatch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface Player {
    id: string;
    name: string;
}

interface TeamLineup {
    team: { id: string; team_name: string };
    squad: Player[];
    lineup: string[]; // array of player ids
    substitutes: string[]; // array of player ids
}

function LineupEditor({ match }: { match: ApiMatch }) {
    const [teamA, setTeamA] = useState<TeamLineup | null>(null);
    const [teamB, setTeamB] = useState<TeamLineup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchLineupData = async () => {
            setIsLoading(true);
            try {
                const lineupData = await getLineup(match.id);
                setTeamA(lineupData.teamA);
                setTeamB(lineupData.teamB);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch lineup data.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchLineupData();
    }, [match.id, toast]);

    const handlePlayerChange = async (student_id: string, team_id: string, is_substitute: boolean, is_checked: boolean) => {
        const action = is_checked ? 'add' : 'remove';
        try {
            await manageLineup(match.id, { action, student_id, team_id, is_substitute });
             toast({ title: 'Lineup Updated', description: `Player ${action}ed successfully.` });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update lineup.' });
        }
    };
    
    if (isLoading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>
    }

    if (!teamA || !teamB) {
        return <p className="text-center text-muted-foreground py-8">Could not load lineup data for this match.</p>
    }

    return (
        <div className="grid md:grid-cols-2 gap-6 mt-4">
            <TeamColumn teamLineup={teamA} onPlayerChange={handlePlayerChange} />
            <TeamColumn teamLineup={teamB} onPlayerChange={handlePlayerChange} />
        </div>
    );
}

function TeamColumn({ teamLineup, onPlayerChange }: { teamLineup: TeamLineup, onPlayerChange: (student_id: string, team_id: string, is_substitute: boolean, is_checked: boolean) => void }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamLineup.team.team_name}</CardTitle>
                <CardDescription>Full Squad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {teamLineup.squad.map(player => {
                    const isInLineup = teamLineup.lineup.includes(player.id);
                    const isSubstitute = teamLineup.substitutes.includes(player.id);
                    return (
                        <div key={player.id} className="flex items-center gap-4 p-2 rounded-md border">
                            <Avatar>
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div className="flex-grow">
                                <p className="font-medium">{player.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`lineup-${player.id}`}
                                    checked={isInLineup}
                                    onCheckedChange={(checked) => onPlayerChange(player.id, teamLineup.team.id, false, !!checked)}
                                />
                                <Label htmlFor={`lineup-${player.id}`} className="text-xs">Start</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                 <Checkbox
                                    id={`sub-${player.id}`}
                                    checked={isSubstitute}
                                    onCheckedChange={(checked) => onPlayerChange(player.id, teamLineup.team.id, true, !!checked)}
                                />
                                <Label htmlFor={`sub-${player.id}`} className="text-xs">Sub</Label>
                            </div>
                        </div>
                    )
                })}
                 {teamLineup.squad.length === 0 && <p className="text-muted-foreground text-center py-4">No players in squad.</p>}
            </CardContent>
        </Card>
    )
}

export function LineupManager({ sportId }: { sportId?: string }) {
    const [matches, setMatches] = useState<ApiMatch[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<ApiMatch | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!sportId) {
            setMatches([]);
            setSelectedMatch(null);
            setIsLoading(false);
            return;
        }

        const fetchMatches = async () => {
            setIsLoading(true);
            try {
                const scheduledPromise = getMatchesBySport(sportId, 'scheduled');
                const livePromise = getLiveMatches();
                const [scheduled, allLive] = await Promise.all([scheduledPromise, livePromise]);
                
                const liveForSport = allLive.filter(m => String(m.sport_id) === sportId);
                const allMatches = [...scheduled, ...liveForSport];
                const uniqueMatches = Array.from(new Map(allMatches.map(item => [item.id, item])).values());
                setMatches(uniqueMatches);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch matches for this sport.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchMatches();
    }, [sportId, toast]);
    
    const handleSelectMatch = (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        setSelectedMatch(match || null);
    }

    const renderContent = () => {
         if (!sportId) {
            return (
                <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a sport to manage lineups.</p>
                </div>
            )
        }

        if (isLoading) {
            return <Skeleton className="h-10 w-full max-w-md mx-auto" />;
        }

        if (matches.length === 0) {
            return (
                <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>No scheduled or live matches for this sport.</p>
                </div>
            )
        }

        return (
            <div className="max-w-md mx-auto space-y-4">
                <Label>Select a Match</Label>
                <Select onValueChange={handleSelectMatch} value={selectedMatch?.id}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a match to manage lineup" />
                    </SelectTrigger>
                    <SelectContent>
                        {matches.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                                {m.TeamA.team_name} vs {m.TeamB.team_name} ({m.Sport.name})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Lineups</CardTitle>
                <CardDescription>View and manage player lineups for each team.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
                
                {selectedMatch ? (
                    <LineupEditor match={selectedMatch} />
                ) : (
                    !isLoading && sportId && matches.length > 0 &&
                    <div className="text-center py-16 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4" />
                        <p>Select a match to view and manage its lineup.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
