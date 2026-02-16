
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getSportsHeadAnalytics, getSportsHeadRegistrations, type SportsHeadAnalytics, type Registration } from "@/lib/api";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Users, Trophy, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: number | string, icon: React.ElementType, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
            </CardContent>
        </Card>
    )
}

export default function SportsHeadDashboardPage() {
    const [analytics, setAnalytics] = useState<SportsHeadAnalytics | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [analyticsData, registrationsData] = await Promise.all([
                    getSportsHeadAnalytics(),
                    getSportsHeadRegistrations()
                ]);
                setAnalytics(analyticsData);
                setRegistrations(registrationsData);
            } catch (error: any) {
                if (error.response?.status === 403) {
                     toast({ variant: 'destructive', title: 'Authorization Error', description: 'You are not assigned to manage any sport.' });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch dashboard data.' });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    return (
         <div className="container py-8 space-y-6">
             <div className="mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">An overview of your assigned sport.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Teams" value={analytics?.totalTeams ?? 0} icon={Trophy} isLoading={isLoading} />
                <StatCard title="Total Players" value={analytics?.totalPlayers ?? 0} icon={Users} isLoading={isLoading} />
                <StatCard title="Upcoming Matches" value={analytics?.upcomingMatches ?? 0} icon={Calendar} isLoading={isLoading} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Registrations</CardTitle>
                    <CardDescription>A list of all participants registered for your sport.</CardDescription>
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
                                        <TableRow key={reg.id}>
                                            <TableCell>
                                                <div className="font-medium">{reg.name}</div>
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
                        <p className="text-center py-10 text-muted-foreground">No one has registered for this sport yet.</p>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}
