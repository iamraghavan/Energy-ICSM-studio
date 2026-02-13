"use client"
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card"
import { Users, BarChart2, TrendingUp, Percent } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { getAdminAnalytics } from "@/lib/api";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";


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

    const chartConfig = {
        count: {
          label: "Registrations",
          color: "hsl(var(--primary))",
        },
      } satisfies ChartConfig;

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

    const sportWiseData = analytics?.sports.map((s: any) => ({ 
        name: s.Sport.name.length > 15 ? s.Sport.name.substring(0,15) + '...' : s.Sport.name, 
        count: s.count 
    })) || [];
    
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
                        <ChartContainer config={chartConfig} className="h-[350px] w-full">
                            <BarChart accessibilityLayer data={sportWiseData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" interval={0} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
