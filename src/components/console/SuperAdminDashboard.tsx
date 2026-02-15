"use client"
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card"
import { Users, TrendingUp, Percent, Download, Printer, Settings2, CalendarIcon, Info, ArrowUp } from "lucide-react"
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


export function SuperAdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [date, setDate] = useState<Date | undefined>();

    const { toast } = useToast();

    useEffect(() => {
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

    const sportWiseData = analytics?.sports.map((s: any) => ({name: s.Sport.name, count: s.count})) || [];
    
    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Bills</h1>
                    <p className="text-sm text-muted-foreground">
                         Page refresh time: {format(currentTime, "eeee, MMMM d, yyyy 'at' hh:mm:ss a zzz")}
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
                            {date ? format(date, "LLL dd, y") : <span>Billing period: February 2026</span>}
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
                    Energy Meet Estimated Bill Summary <Info className="h-4 w-4 text-muted-foreground"/>
                </h2>
                <p className="text-sm text-muted-foreground">Total charges and payment information</p>

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

                 <div className="mt-6 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Service provider</p>
                            <p className="font-medium">Energy Meet Org</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-sm text-muted-foreground">Total in INR</p>
                            <p className="text-lg font-semibold">₹{analytics?.stats.totalCollection || '0.00'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t pt-4 flex justify-between items-center">
                    <p className="text-lg font-semibold">Estimated grand total:</p>
                    <p className="text-2xl font-bold">₹{analytics?.stats.totalCollection || '0.00'}</p>
                </div>
            </div>

            <div className="border rounded-lg p-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold flex items-center gap-2">
                            Highest estimated cost by service provider <Info className="h-4 w-4 text-muted-foreground"/>
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
                        <p className="text-sm text-muted-foreground">Highest Sport Spend</p>
                        <p className="text-2xl font-bold">₹{analytics?.sports[0]?.totalAmount || '0.00'}</p>
                        <p className="text-sm font-medium mt-2">{analytics?.sports[0]?.Sport.name}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Trend compared to prior month</p>
                        <p className="text-2xl font-bold flex items-center gap-2 text-green-600"><ArrowUp/> 5,200%</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="by-service">
                <TabsList>
                    <TabsTrigger value="by-service">Charges by service</TabsTrigger>
                    <TabsTrigger value="by-account">Charges by account</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>
                <TabsContent value="by-service" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Energy Meet Org charges by service</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Service name</TableHead>
                                    <TableHead>Registrations</TableHead>
                                    <TableHead className="text-right">Amount (INR)</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics?.sports.map((s: any) => (
                                        <TableRow key={s.Sport.id}>
                                            <TableCell>{s.Sport.name}</TableCell>
                                            <TableCell>{s.count}</TableCell>
                                            <TableCell className="text-right">{s.totalAmount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
