
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { getSportsHeadTeams, createSportsHeadTeam, getSportsHeadRegistrations, type SportsHeadTeam, type SportsHeadRegistration, getSports, type ApiSport } from "@/lib/api";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function CreateTeamDialog({ student, sports, onTeamCreated, onClose }: { student: SportsHeadRegistration | null, sports: ApiSport[], onTeamCreated: () => void, onClose: () => void }) {
    const { toast } = useToast();
    const [teamName, setTeamName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (student && sports.length > 0) {
            const registrationSport = student.Sports[0];
            if (!registrationSport) return;

            const fullSport = sports.find(s => s.id === registrationSport.id);
            if (!fullSport) return;

            const sportCategory = fullSport.category ? ` - ${fullSport.category.toUpperCase()}` : '';
            const sportName = fullSport.name ? ` - ${fullSport.name.toUpperCase()}` : '';
            
            const generatedName = `${student.college_name}${sportName}${sportCategory}`;
            setTeamName(generatedName);
        }
    }, [student, sports]);

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
    const [sports, setSports] = useState<ApiSport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasTeamError, setHasTeamError] = useState(false);
    const [studentToCreateFor, setStudentToCreateFor] = useState<SportsHeadRegistration | null>(null);
    const { toast } = useToast();
    
    const unassignedRegistrations = registrations.filter(reg => !reg.team_created);

    const fetchData = async () => {
        setIsLoading(true);
        setHasTeamError(false);
        
        try {
            // Fetch registrations and sports which are usually reliable
            const [regsData, sportsData] = await Promise.all([
                getSportsHeadRegistrations().catch(err => {
                    console.error("Regs Error:", err);
                    return [] as SportsHeadRegistration[];
                }),
                getSports().catch(err => {
                    console.error("Sports Error:", err);
                    return [] as ApiSport[];
                }),
            ]);
            
            setRegistrations(regsData);
            setSports(sportsData);

            // Fetch teams separately so it doesn't block the rest of the UI if the 500 error persists
            try {
                const teamsData = await getSportsHeadTeams();
                setTeams(teamsData);
            } catch (teamError) {
                console.error("Teams Error:", teamError);
                setHasTeamError(true);
                // Partial failure: we still have registrations, so we don't throw an error toast
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Fetch Error', description: 'Could not load registration data.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container py-8 space-y-8">
            {hasTeamError && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl shadow-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Teams Sync Issue</AlertTitle>
                    <AlertDescription className="text-xs font-medium">
                        The teams directory is currently experiencing a server error. However, you can still view registrations and create new teams using the list below.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle>Created Teams</CardTitle>
                    <CardDescription>View and manage all teams for your assigned sport.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : teams.length > 0 ? (
                         <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-bold">Team Name</TableHead>
                                        <TableHead className="font-bold">Captain</TableHead>
                                        <TableHead className="font-bold">Players</TableHead>
                                        <TableHead className="text-right px-6 font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teams.map(team => (
                                        <TableRow key={team.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-900">{team.team_name}</TableCell>
                                            <TableCell>{team.Captain?.name || 'Not Assigned'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono">{team.player_count}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Button asChild variant="outline" size="sm" className="font-bold">
                                                    <Link href={`/console/sports-head/teams/${team.id}`}>Manage</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-slate-600">
                                {hasTeamError ? "Teams currently unreachable" : "No teams found for this sport"}
                            </p>
                            <p className="text-xs mt-1">Start creating teams from the registrations list below.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle>Registrations Pending Team Creation</CardTitle>
                    <CardDescription>Approved registrations awaiting team assignment.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                     {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : unassignedRegistrations.length > 0 ? (
                         <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-bold">Name & Code</TableHead>
                                        <TableHead className="font-bold">College</TableHead>
                                        <TableHead className="font-bold">Contact Info</TableHead>
                                        <TableHead className="text-right px-6 font-bold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unassignedRegistrations.map(reg => (
                                        <TableRow key={reg.id} className="hover:bg-slate-50/50">
                                            <TableCell>
                                                <div className="font-bold text-slate-900">{reg.name}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{reg.registration_code}</div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-slate-600 max-w-[200px] truncate">{reg.college_name}</TableCell>
                                            <TableCell>
                                                <div className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]">{reg.email}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">{reg.mobile}</div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Button size="sm" onClick={() => setStudentToCreateFor(reg)} className="font-bold shadow-md shadow-primary/10">
                                                    Create Team
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground border rounded-xl bg-slate-50/20 italic text-sm">
                            All registered students for your sport have been assigned to a team.
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateTeamDialog
                student={studentToCreateFor}
                sports={sports}
                onClose={() => setStudentToCreateFor(null)}
                onTeamCreated={() => {
                    setStudentToCreateFor(null);
                    fetchData();
                }}
            />
        </div>
    );
}
