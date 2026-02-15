"use client"
import { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Download, Printer, Settings2, CalendarIcon, Info, ArrowUp } from "lucide-react"
import { getAdminAnalytics } from "@/lib/api";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import _ from 'lodash';


export function SuperAdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [date, setDate] = useState<Date | undefined>();

    const { toast } = useToast();

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
            Sport: { name },
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
    
    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Admin Overview</h1>
                    <p className="text-sm text-muted-foreground">
                         {currentTime ? `Page refresh time: ${format(currentTime, "eeee, MMMM d, yyyy 'at' hh:mm:ss a zzz")}` : <Skeleton className="h-4 w-64" />}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Download/> Download all to CSV</Button>
                    <Button variant="outline"><Printer/> Print</Button>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"secondary"}
                            className={cn(
                                "w-full sm:w-auto justify-start text-left font-normal"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "LLL dd, y") : <span>Date filter</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon"><Settings2/></Button>
                </div>
            </div>

            <div className="border rounded-lg p-6">
                <h2 className="font-semibold flex items-center gap-2">
                    Energy Meet Registration Summary <Info className="h-4 w-4 text-muted-foreground"/>
                </h2>
                <p className="text-sm text-muted-foreground">High-level registration and payment metrics</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Registrations</p>
                        <p className="text-2xl font-medium">{analytics?.stats.totalRegistrations || 0}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Approved Payments</p>
                        <p className="text-2xl font-medium">{analytics?.stats.approvedPayments || 0}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Collection Rate</p>
                        <p className="text-2xl font-medium">{parseFloat(analytics?.stats.collectionRate || 0).toFixed(2)}%</p>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg p-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold flex items-center gap-2">
                            Top Sport by Registration <Info className="h-4 w-4 text-muted-foreground"/>
                        </h2>
                        <p className="text-sm text-muted-foreground">Viewing Energy Meet Org</p>
                    </div>
                    <div>
                        <Select defaultValue="energy-meet">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="energy-meet">Energy Meet Org</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Most Registered Sport</p>
                        <p className="text-2xl font-bold">{aggregatedSports[0]?.Sport.name || 'N/A'}</p>
                        <p className="text-sm font-medium mt-2">{aggregatedSports[0]?.count || 0} registrations</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Trend compared to prior month</p>
                        <p className="text-2xl font-bold flex items-center gap-2 text-green-600"><ArrowUp/> 5,200%</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="by-service">
                <TabsList>
                    <TabsTrigger value="by-service">Registrations by service</TabsTrigger>
                    <TabsTrigger value="by-account">Registrations by account</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>
                <TabsContent value="by-service" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Energy Meet Org registrations by service</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Service name</TableHead>
                                    <TableHead className="text-right">Registrations</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aggregatedSports.map((s: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{s.Sport.name}</TableCell>
                                            <TableCell className="text-right">{s.count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="by-account" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Registrations by account</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <p className="text-muted-foreground text-center py-8">Data for this view is not yet available.</p>
                         </CardContent>
                    </Card>
                 </TabsContent>
                 <TabsContent value="invoices" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <p className="text-muted-foreground text-center py-8">Invoice data is not yet available.</p>
                         </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </div>
    )
}
