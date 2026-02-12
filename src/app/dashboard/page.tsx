"use client"
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card"
import { Users, Package, CreditCard, BedDouble } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { colleges } from "@/lib/data"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { getSports, type ApiSport } from "@/lib/api";

const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

export default function DashboardPage() {
    const [sportWiseData, setSportWiseData] = useState<any[]>([]);
    const [collegeWiseData, setCollegeWiseData] = useState<any[]>([]);

    useEffect(() => {
        getSports().then(apiSports => {
            const uniqueSports = Array.from(new Map(apiSports.map(s => [s.name, s])).values());
            setSportWiseData(uniqueSports.map(s => ({ name: s.name.length > 10 ? s.name.substring(0,10) + '...' : s.name, count: Math.floor(Math.random() * 50) + 10 })));
        });
        setCollegeWiseData(colleges.map(c => ({ name: c.name.split(' ')[0], count: Math.floor(Math.random() * 100) + 20 })));
    }, []);

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+5.2% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground">+12.1% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payments Pending</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">$8,520</div>
                    <p className="text-xs text-muted-foreground">23 pending payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accommodation</CardTitle>
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">459</div>
                    <p className="text-xs text-muted-foreground">Total requests</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sport-wise Registrations</CardTitle>
                        <CardDescription>A breakdown of registrations by sport.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart accessibilityLayer data={sportWiseData} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>College-wise Registrations</CardTitle>
                        <CardDescription>A breakdown of registrations by college.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart accessibilityLayer data={collegeWiseData} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                                <XAxis type="number" hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="count" layout="vertical" fill="var(--color-count)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
