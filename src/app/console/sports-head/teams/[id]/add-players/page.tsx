
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getSportsHeadStudents, bulkAddPlayersToTeam, getSportsHeadTeamDetails, type SportStudent, type FullSportsHeadTeam } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ArrowLeft, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BulkAddPlayersPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.id as string;

    const { toast } = useToast();
    const [team, setTeam] = useState<FullSportsHeadTeam | null>(null);
    const [allStudents, setAllStudents] = useState<SportStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    useEffect(() => {
        if (teamId) {
            setIsLoading(true);
            Promise.all([
                getSportsHeadTeamDetails(teamId),
                getSportsHeadStudents()
            ]).then(([teamData, studentsData]) => {
                const teamMemberStudentIds = new Set(teamData.members.map(m => m.student_id));
                const unassigned = studentsData.filter(s => !teamMemberStudentIds.has(s.student_id));
                setTeam(teamData);
                setAllStudents(unassigned);
            }).catch(() => {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch required data.' });
            }).finally(() => setIsLoading(false));
        }
    }, [teamId, toast]);

    const remainingSlots = team ? team.Sport.max_players - team.members.length : 0;
    const canAddMore = selectedStudentIds.length < remainingSlots;

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return allStudents;
        return allStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.college.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allStudents]);

    const handleSelectStudent = (regId: string) => {
        const isSelected = selectedStudentIds.includes(regId);
        if (isSelected) {
            setSelectedStudentIds(prev => prev.filter(id => id !== regId));
        } else {
            if (canAddMore) {
                setSelectedStudentIds(prev => [...prev, regId]);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Team Full',
                    description: `You can only add ${remainingSlots} more players to this team.`,
                });
            }
        }
    };

    const handleAddPlayers = async () => {
        if (selectedStudentIds.length === 0) {
            toast({ variant: 'destructive', title: 'No players selected' });
            return;
        }
        setIsSubmitting(true);
        try {
            await bulkAddPlayersToTeam(teamId, selectedStudentIds);
            toast({ title: 'Success', description: `${selectedStudentIds.length} player(s) added to the team.` });
            router.push(`/console/sports-head/teams/${teamId}`);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to add players', description: error.response?.data?.message || 'An error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-8 space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!team) {
         return (
            <div className="container py-8 text-center">
                <p className="text-destructive">Team not found or could not be loaded.</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push(`/console/sports-head/teams/${teamId}`)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle>Bulk Add Players to {team.team_name}</CardTitle>
                            <CardDescription>Select students from the list of unassigned players for {team.Sport.name}.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Team Capacity</AlertTitle>
                        <AlertDescription className="flex justify-between items-center">
                           <span>You can add up to <strong>{remainingSlots}</strong> more players.</span>
                           <Badge>Selected: {selectedStudentIds.length}</Badge>
                        </AlertDescription>
                    </Alert>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or college..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-96">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <div
                                        key={student.registration_id}
                                        onClick={() => handleSelectStudent(student.registration_id)}
                                        className={cn(
                                            "cursor-pointer transition-all border rounded-lg p-4 flex flex-col items-start gap-4 hover:bg-muted/50 relative",
                                            selectedStudentIds.includes(student.registration_id) && "border-primary ring-2 ring-primary bg-primary/5",
                                            !canAddMore && !selectedStudentIds.includes(student.registration_id) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2">
                                            <Checkbox
                                                checked={selectedStudentIds.includes(student.registration_id)}
                                                onCheckedChange={() => handleSelectStudent(student.registration_id)}
                                                disabled={!canAddMore && !selectedStudentIds.includes(student.registration_id)}
                                            />
                                        </div>
                                         <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('').substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">{student.college}</p>
                                            </div>
                                        </div>
                                        {student.mobile && <Badge variant="outline" className="font-mono">{student.mobile}</Badge>}
                                    </div>
                                ))
                            ) : (
                                <div className="md:col-span-3 text-center py-16 text-muted-foreground border rounded-lg">
                                    <p>No unassigned players found.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                     <Button variant="ghost" onClick={() => router.push(`/console/sports-head/teams/${teamId}`)}>Cancel</Button>
                    <Button onClick={handleAddPlayers} disabled={isSubmitting || selectedStudentIds.length === 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} Player(s)` : 'Player(s)'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

