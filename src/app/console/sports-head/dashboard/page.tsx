
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getSportsHeadStats, getSportsHeadAnalytics, type Registration } from "@/lib/api";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Users, Trophy, Calendar, Clapperboard } from 'lucide-react';
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
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statsData, analyticsData] = await Promise.all([
                    getSportsHeadStats(),
                    getSportsHeadAnalytics()
                ]);
                setStats(statsData.stats);
                setAnalytics(analyticsData);
                setRecentActivity(statsData.recent_activity || []);

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
    
    const matchDistribution = analytics?.match_distribution || {};

    return (
         <div className="container py-8 space-y-6">
             <div className="mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">An overview of your assigned sport.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Teams" value={stats?.total_teams ?? 0} icon={Trophy} isLoading={isLoading} />
                <StatCard title="Total Players" value={stats?.total_players ?? 0} icon={Users} isLoading={isLoading} />
                <StatCard title="Upcoming Matches" value={stats?.upcoming_matches ?? 0} icon={Calendar} isLoading={isLoading} />
                <StatCard title="Live Matches" value={stats?.live_matches ?? 0} icon={Clapperboard} isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>The last 5 approved registrations for your sport.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : recentActivity.length > 0 ? (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Registration Code</TableHead>
                                            <TableHead>Approved On</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentActivity.map(activity => (
                                            <TableRow key={activity.id}>
                                                <TableCell className="font-medium">{activity.name}</TableCell>
                                                <TableCell>{activity.registration_code}</TableCell>
                                                <TableCell>{format(new Date(activity.created_at), 'PPP')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center py-10 text-muted-foreground">No recent activity for this sport yet.</p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Match Distribution</CardTitle>
                        <CardDescription>Breakdown of matches by status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-24" /> : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Scheduled</span>
                                    <span className="font-bold text-lg">{matchDistribution.scheduled || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Live</span>
                                    <span className="font-bold text-lg">{matchDistribution.live || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Completed</span>
                                    <span className="font-bold text-lg">{matchDistribution.completed || 0}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
