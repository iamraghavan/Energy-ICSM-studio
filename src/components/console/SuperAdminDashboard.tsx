"use client"
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card"
import { Users, TrendingUp, Percent } from "lucide-react"
import { getAdminAnalytics } from "@/lib/api";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Chart } from "react-google-charts";


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

    const sportWiseData = analytics?.sports.map((s: any) => ([s.Sport.name, s.count, 'color: hsl(var(--primary))'])) || [];
    const chartData = [
        ['Sport', 'Registrations', { role: 'style' }],
        ...sportWiseData
    ];
    
    return (
        <div className="container py-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{analytics?.stats.totalRegistrations || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approved Payments</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{analytics?.stats.approvedPayments || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{parseFloat(analytics?.stats.collectionRate || 0).toFixed(2)}%</div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Sport-wise Registrations</CardTitle>
                        <CardDescription>A breakdown of registrations by sport.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {chartData.length > 1 ? (
                            <Chart
                                chartType="ColumnChart"
                                width="100%"
                                height="400px"
                                data={chartData}
                                options={{
                                    chartArea: { width: '85%' },
                                    hAxis: {
                                        slantedText: true,
                                        slantedTextAngle: 45,
                                        textStyle: { color: 'hsl(var(--muted-foreground))' },
                                        titleTextStyle: { color: 'hsl(var(--muted-foreground))' }
                                    },
                                    vAxis: {
                                        title: 'Total Registrations',
                                        minValue: 0,
                                        textStyle: { color: 'hsl(var(--muted-foreground))' },
                                        titleTextStyle: { color: 'hsl(var(--muted-foreground))' }
                                    },
                                    legend: { position: 'none' },
                                    backgroundColor: 'transparent',
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-96">
                                <p className="text-muted-foreground">No registration data available to display.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
