

'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { getSportsHeadTeams, getSportsHeadRegistrations, createSportsHeadTeam, type SportsHeadTeam, type SportsHeadRegistration } from "@/lib/api";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

function CreateTeamDialog({ student, onTeamCreated, onClose }: { student: SportsHeadRegistration | null, onTeamCreated: () => void, onClose: () => void }) {
    const { toast } = useToast();
    const [teamName, setTeamName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (student) {
            const sport = student.Sports[0];
            const sportCategory = sport ? ` - ${sport.category.toUpperCase()}` : '';
            const sportName = sport ? ` - ${sport.name.toUpperCase()}` : '';
            const generatedName = `${student.college_name}${sportName}${sportCategory}`;
            setTeamName(generatedName);
        }
    }, [student]);

    if (!student) return null;

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createSportsHeadTeam({
                team_name: teamName,
                registration_id: student.id,
            });
            toast({ title: 'Team Created', description: `'${teamName}' has been created.` });
            onTeamCreated();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to create team.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isOpen = !!student;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Team for {student.name}</DialogTitle>
                    <DialogDescription>A team name has been auto-generated. You can edit it before creating.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Team
                    </Button>
                </DialogFooter>
             </DialogContent>
        </Dialog>
    )
}


export default function SportsHeadTeamsPage() {
    const [teams, setTeams] = useState<SportsHeadTeam[]>([]);
    const [registrations, setRegistrations] = useState<SportsHeadRegistration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [studentToCreateFor, setStudentToCreateFor] = useState<SportsHeadRegistration | null>(null);
    const { toast } = useToast();
    
    const unassignedRegistrations = registrations.filter(reg => !reg.team_created);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [teamsData, regsData] = await Promise.all([
                getSportsHeadTeams(),
                getSportsHeadRegistrations()
            ]);
            setTeams(teamsData);
            setRegistrations(regsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch teams and registrations.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container py-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Created Teams</CardTitle>
                    <CardDescription>View and manage all teams for your assigned sport.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : teams.length > 0 ? (
                         <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Team Name</TableHead>
                                        <TableHead>Captain</TableHead>
                                        <TableHead>Player Count</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teams.map(team => (
                                        <TableRow key={team.id}>
                                            <TableCell className="font-medium">{team.team_name}</TableCell>
                                            <TableCell>{team.Captain?.name || 'Not Assigned'}</TableCell>
                                            <TableCell>{team.player_count}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/console/sports-head/teams/${team.id}`}>Manage</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground border rounded-lg">
                            <Users className="h-12 w-12 mx-auto mb-4" />
                            <p className="font-medium">No teams found for this sport.</p>
                            <p className="text-sm">Create teams from the unassigned registrations below.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Registrations Pending Team Creation</CardTitle>
                    <CardDescription>These students have registered for your sport but do not have a team yet.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : unassignedRegistrations.length > 0 ? (
                         <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unassignedRegistrations.map(reg => (
                                        <TableRow key={reg.id}>
                                            <TableCell>
                                                <div className="font-medium">{reg.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{reg.registration_code}</div>
                                            </TableCell>
                                            <TableCell>{reg.college_name}</TableCell>
                                            <TableCell>
                                                <div>{reg.email}</div>
                                                <div className="text-muted-foreground">{reg.mobile}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => setStudentToCreateFor(reg)}>Create Team</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground border rounded-lg">
                            <p className="font-medium">All registered students have been assigned to a team.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateTeamDialog
                student={studentToCreateFor}
                onClose={() => setStudentToCreateFor(null)}
                onTeamCreated={() => {
                    setStudentToCreateFor(null);
                    fetchData();
                }}
            />
        </div>
    );
}

