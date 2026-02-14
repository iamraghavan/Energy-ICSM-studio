
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentSession, type StudentSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStudentDashboardOverview, createStudentTeam, type StudentDashboardOverview, type DashboardSport } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

function CreateTeamDialog({ sport, onTeamCreated }: { sport: DashboardSport, onTeamCreated: () => void }) {
    const [teamName, setTeamName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    const handleCreateTeam = async () => {
        if (!teamName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Team name is required.' });
            return;
        }
        setIsCreating(true);
        try {
            await createStudentTeam(sport.id, teamName);
            toast({ title: 'Success!', description: `Team "${teamName}" has been created.` });
            onTeamCreated();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create team.' });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Team for {sport.name}</DialogTitle>
                <DialogDescription>Enter a name for your team.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g., College Warriors" />
            </div>
            <DialogFooter>
                <Button onClick={handleCreateTeam} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Team
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

function SportCard({ sport, onTeamCreated }: { sport: DashboardSport, onTeamCreated: () => void }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{sport.name}</CardTitle>
                <CardDescription>{sport.type} Event</CardDescription>
            </CardHeader>
            <CardContent>
                {sport.type === 'Team' ? (
                    sport.team ? (
                        <div className='space-y-2'>
                            <p className="font-semibold">{sport.team.team_name}</p>
                            <Progress value={(sport.team.members_count / sport.max_players) * 100} />
                            <p className="text-sm text-muted-foreground">{sport.team.members_count} / {sport.max_players} players</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">You haven't created a team for this sport yet.</p>
                    )
                ) : (
                    <p className="text-sm text-muted-foreground">You are registered for this individual event.</p>
                )}
            </CardContent>
            {sport.type === 'Team' && (
                 <CardFooter>
                     {sport.team ? (
                          <Button asChild className="w-full">
                            <Link href={`/energy/2026/student/dashboard/teams/${sport.team.id}`}>Manage Team</Link>
                          </Button>
                     ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full">Create Team</Button>
                            </DialogTrigger>
                           <CreateTeamDialog sport={sport} onTeamCreated={onTeamCreated} />
                        </Dialog>
                     )}
                 </CardFooter>
            )}
        </Card>
    );
}

export default function StudentDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<StudentSession | null>(null);
    const [dashboardData, setDashboardData] = useState<StudentDashboardOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const data = await getStudentDashboardOverview();
            setDashboardData(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load your dashboard.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const studentSession = getStudentSession();
        if (!studentSession) {
            router.replace('/energy/2026/auth?action=login');
        } else {
            setSession(studentSession);
            fetchDashboardData();
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_session');
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/energy/2026');
    };

    if (isLoading || !session) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Welcome, {session.name}!</h1>
                <p className="text-muted-foreground mt-2">Manage your registrations and teams.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>My Registrations</CardTitle>
                    <CardDescription>An overview of the sports you have registered for.</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardData && dashboardData.registered_sports.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dashboardData.registered_sports.map(sport => (
                                <SportCard key={sport.id} sport={sport} onTeamCreated={fetchDashboardData} />
                            ))}
                        </div>
                    ) : (
                         <p className="text-muted-foreground text-center py-8">
                            {isLoading ? 'Loading your registrations...' : 'You have not registered for any sports yet.'}
                        </p>
                    )}
                </CardContent>
            </Card>
            
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleLogout}>Logout</Button>
                </CardContent>
            </Card>
        </div>
    );
}
