
'use client';

import React, { useMemo, useState } from 'react';
import { useDashboard } from './layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createStudentTeam, type ApiSport } from '@/lib/api';
import type { StudentDashboardOverview } from '@/lib/api';


function RegistrationDetailsCard({ registration }: { registration: StudentDashboardOverview['registration'] }) {
    if (!registration) return null;

    const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';
    const ticketUrl = `${API_BASE_URL}/register/${registration.id}/ticket`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your primary registration information.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Registration Code</TableCell>
                            <TableCell className="font-mono">{registration.code}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Name</TableCell>
                            <TableCell>{registration.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Email</TableCell>
                            <TableCell>{registration.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">College</TableCell>
                            <TableCell>{registration.college}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">Registration Status</TableCell>
                            <TableCell><Badge variant={registration.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{registration.status}</Badge></TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">Payment Status</TableCell>
                            <TableCell><Badge variant={registration.payment_status === 'approved' || registration.payment_status === 'verified' ? 'default' : registration.payment_status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">{registration.payment_status}</Badge></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                 <Button asChild className="w-full">
                    <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download Ticket
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}

function CreateTeamDialog({ sport, onTeamCreated, collegeName }: { sport: ApiSport, onTeamCreated: () => void, collegeName: string }) {
    const [teamName, setTeamName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (collegeName && sport) {
            const generatedName = `${collegeName} - ${sport.name} - ${sport.category}`.toUpperCase();
            setTeamName(generatedName);
        }
    }, [collegeName, sport]);


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
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to create team.' });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Team for {sport.name}</DialogTitle>
                <DialogDescription>Enter a name for your team. An auto-generated name is provided.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g., College Warriors" />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateTeam} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Team
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

function SportCard({ sport, onTeamCreated, collegeName }: { sport: any, onTeamCreated: () => void, collegeName: string }) {
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{sport.name}</CardTitle>
                <CardDescription>{sport.type} Event ({sport.category})</CardDescription>
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
                           <CreateTeamDialog sport={sport} onTeamCreated={onTeamCreated} collegeName={collegeName} />
                        </Dialog>
                     )}
                 </CardFooter>
            )}
        </Card>
    );
}

export default function StudentDashboardPage() {
    const { dashboardData, isLoading, refetch } = useDashboard();
    
    const processedSports = useMemo(() => {
        if (!dashboardData) return [];
        return dashboardData.registered_sports.map(sport => {
            const teamInfo = dashboardData.teams.find(t => t.sport_id === sport.id);
            return {
                ...sport,
                team: teamInfo ? {
                    id: teamInfo.id,
                    team_name: teamInfo.team_name,
                    members_count: teamInfo.Members?.length || 0,
                } : null
            };
        });
    }, [dashboardData]);


    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card><CardHeader><CardTitle>My Profile</CardTitle></CardHeader><CardContent><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
                <Card><CardHeader><CardTitle>My Sports Registrations</CardTitle></CardHeader><CardContent><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {dashboardData?.registration && <RegistrationDetailsCard registration={dashboardData.registration} />}
            
            <Card>
                <CardHeader>
                    <CardTitle>My Sports Registrations</CardTitle>
                    <CardDescription>An overview of the sports you have registered for.</CardDescription>
                </CardHeader>
                <CardContent>
                    {processedSports.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {processedSports.map(sport => (
                                <SportCard 
                                    key={sport.id} 
                                    sport={sport} 
                                    onTeamCreated={refetch} 
                                    collegeName={dashboardData?.registration.college || ''} 
                                />
                            ))}
                        </div>
                    ) : (
                         <p className="text-muted-foreground text-center py-8">
                            {isLoading ? 'Loading your registrations...' : 'You have not registered for any sports yet.'}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
