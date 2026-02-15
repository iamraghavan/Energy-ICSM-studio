'use client';
import { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
  } from "@/components/ui/card"
import { Users, CreditCard, Clock, Percent } from "lucide-react"
import { getAdminAnalytics } from "@/lib/api";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import _ from 'lodash';

export function SuperAdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getAdminAnalytics().then(data => {
            setAnalytics(data);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load dashboard analytics.' });
            setIsLoading(false);
        })
    }, [toast]);
    
    const aggregatedSports = useMemo(() => {
        if (!analytics?.sports) return [];
        const grouped = _.groupBy(analytics.sports, 'Sport.name');
        return _.map(grouped, (group, name) => ({
            name: name,
            count: _.sumBy(group, 'count')
        })).sort((a, b) => b.count - a.count);
    }, [analytics?.sports]);

    if (isLoading) {
        return (
            <div className="container py-8 space-y-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
                <div className="grid gap-4 md:gap-8">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    const stats = analytics?.stats || {};
    
    return (
        <div className="container py-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRegistrations || 0}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Payments</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approvedPayments || 0}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingPayments || 0}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{parseFloat(stats.collectionRate || 0).toFixed(2)}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registrations by Sport</CardTitle>
                    <CardDescription>A summary of total registrations for each sport.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sport Name</TableHead>
                                <TableHead className="text-right">Total Registrations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {aggregatedSports.map((s: any) => (
                                <TableRow key={s.name}>
                                    <TableCell className="font-medium">{s.name}</TableCell>
                                    <TableCell className="text-right">{s.count}</TableCell>
                                </TableRow>
                            ))}
                            {aggregatedSports.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-10 text-muted-foreground">
                                        No sport registration data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
