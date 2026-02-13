'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getRegistrations, type Registration, getSports } from "@/lib/api";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchScheduler } from './scorer/MatchScheduler';
import { UserSession } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export function SportsHeadDashboard({ user }: { user: UserSession }) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [sportName, setSportName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!user.assigned_sport_id) {
            toast({ variant: 'destructive', title: 'Error', description: 'No sport assigned to this account.' });
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [allRegistrations, allSports] = await Promise.all([
                    getRegistrations(),
                    getSports()
                ]);

                const assignedSport = allSports.find(s => String(s.id) === user.assigned_sport_id);
                setSportName(assignedSport?.name || 'Your Sport');

                const filtered = allRegistrations.filter(reg => 
                    reg.Sports.some(sport => String(sport.id) === user.assigned_sport_id)
                );
                setRegistrations(filtered);
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch dashboard data.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user.assigned_sport_id, toast]);
    
    if (!user.assigned_sport_id) {
        return <Card><CardHeader><CardTitle className="text-destructive">Configuration Error</CardTitle></CardHeader><CardContent><p>This Sports Head account does not have a sport assigned to it.</p></CardContent></Card>;
    }

    return (
         <div className="container py-8 space-y-6">
             <div className="mb-6">
                <h1 className="text-3xl font-bold">Sports Head Dashboard</h1>
                <p className="text-muted-foreground">Manage registrations and matches for <span className="font-semibold text-primary">{sportName}</span>.</p>
            </div>
            <Tabs defaultValue="registrations">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="registrations">Registrations</TabsTrigger>
                    <TabsTrigger value="scheduler">Match Scheduler</TabsTrigger>
                </TabsList>
                <TabsContent value="registrations" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Registrations for {sportName}</CardTitle>
                            <CardDescription>A list of all participants registered for this sport.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                             ) : registrations.length > 0 ? (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>College</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {registrations.map(reg => (
                                                <TableRow key={reg.id} onClick={() => router.push(`/console/registrations/${reg.registration_code}`)} className="cursor-pointer">
                                                    <TableCell>
                                                        <div className="font-medium">{reg.Student.name}</div>
                                                        <div className="text-xs font-mono text-muted-foreground">{reg.registration_code}</div>
                                                    </TableCell>
                                                    <TableCell>{reg.college_name}</TableCell>
                                                    <TableCell>{format(new Date(reg.created_at), 'PPP')}</TableCell>
                                                    <TableCell><Badge variant={reg.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{reg.status}</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                             ) : (
                                <p className="text-center py-10 text-muted-foreground">No one has registered for {sportName} yet.</p>
                             )}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="scheduler" className="mt-4">
                     <MatchScheduler sportId={user.assigned_sport_id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
