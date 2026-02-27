'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Search, SlidersHorizontal, CheckCircle, Package, UserCheck, X, Printer } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getCommitteeRegistrations, updateCheckIn, type Registration, getSports, getColleges, type ApiSport, type College, getPassHTML } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';

export function CommitteeDashboard() {
    const [filters, setFilters] = useState({
        search: '',
        sport_id: '',
        status: '',
        payment_status: '',
        college_id: '',
    });
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [sports, setSports] = useState<ApiSport[]>([]);
    const [colleges, setColleges] = useState<College[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(handler);
    }, [filters.search]);

     const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
                if (value) acc[key] = value;
                return acc;
            }, {} as any);
            if (debouncedSearch) activeFilters.search = debouncedSearch;
            
            const data = await getCommitteeRegistrations(activeFilters);
            setRegistrations(data);
        } catch (err) {
            toast({ variant: 'destructive', title: 'Search Failed', description: 'Could not perform search.'});
        } finally {
            setIsLoading(false);
        }
    }, [toast, filters, debouncedSearch]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [sportsData, collegesData] = await Promise.all([getSports(), getColleges()]);
                setSports(sportsData);
                setColleges(collegesData);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load filter options.' });
            }
        };
        fetchFilterOptions();
    }, [toast]);
    
    const handleUpdateCheckinStatus = async (registrationId: string, updateData: { check_in_status?: boolean; kit_delivered?: boolean; id_verified?: boolean; }, name: string) => {
        try {
            await updateCheckIn(registrationId, updateData);
            setRegistrations(prev => 
                prev.map(reg => reg.id === registrationId ? { ...reg, ...updateData, checked_in: updateData.check_in_status ?? reg.checked_in } : reg)
            );
            const actionText = updateData.check_in_status ? 'Checked In' : updateData.kit_delivered ? 'Kit Delivered' : 'ID Verified';
            toast({ title: 'Success', description: `${name} has been updated: ${actionText}.` });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update registration status.' });
        }
    };

    const handlePrintPass = async (registrationId: string) => {
        try {
            const passHtml = await getPassHTML(registrationId);
            const printWindow = window.open('', '_blank', 'width=1000,height=800');

            if (!printWindow) {
                toast({
                    variant: 'destructive',
                    title: "Popup Blocked",
                    description: "Please allow popups for this site to print the pass.",
                });
                return;
            }

            printWindow.document.write(passHtml);
            printWindow.document.close();
            
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };

        } catch (error) {
            console.error("Failed to generate or print pass:", error);
            toast({
                variant: "destructive",
                title: "Error Generating Pass",
                description: "Could not retrieve the pass. Please try again.",
            });
        }
    };
    
    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
    };

    const clearFilters = () => {
        setFilters({ search: '', sport_id: '', status: '', payment_status: '', college_id: '' });
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => key !== 'search' && value !== '');

    return (
        <div className="w-full px-4 md:px-8 py-8 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Committee Dashboard</h1>
                    <p className="text-muted-foreground">Real-time participant check-in and on-ground logistics.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Registration List</CardTitle>
                    <CardDescription>Manage kit delivery and check-in status for all approved participants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, code, or mobile..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="shrink-0">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Advanced Filters
                                    {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-screen max-w-xs sm:max-w-sm md:max-w-md" align="end">
                                <div className="space-y-4 p-2">
                                     <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm uppercase tracking-wider">Filters</h4>
                                        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"><X className="mr-1 h-3 w-3" />Clear All</Button>}
                                     </div>
                                     <div className="grid gap-3">
                                         <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">By Sport</label>
                                            <Select value={filters.sport_id || 'all'} onValueChange={v => handleFilterChange('sport_id', v)}>
                                                <SelectTrigger className="h-9"><SelectValue placeholder="All Sports" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Sports</SelectItem>
                                                    {sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.category})</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                         </div>
                                         <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground">By College</label>
                                            <Select value={filters.college_id || 'all'} onValueChange={v => handleFilterChange('college_id', v)}>
                                                <SelectTrigger className="h-9"><SelectValue placeholder="All Colleges" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Colleges</SelectItem>
                                                    {colleges.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                         </div>
                                         <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Reg. Status</label>
                                                <Select value={filters.status || 'all'} onValueChange={v => handleFilterChange('status', v)}>
                                                    <SelectTrigger className="h-9"><SelectValue placeholder="Any" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Any Status</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="approved">Approved</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Payment</label>
                                                <Select value={filters.payment_status || 'all'} onValueChange={v => handleFilterChange('payment_status', v)}>
                                                    <SelectTrigger className="h-9"><SelectValue placeholder="Any" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Any Status</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="approved">Approved</SelectItem>
                                                        <SelectItem value="verified">Verified</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                         </div>
                                     </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="border rounded-lg overflow-hidden bg-card">
                       <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wider">Participant</th>
                                        <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wider hidden sm:table-cell">College</th>
                                        <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wider hidden md:table-cell">Sports</th>
                                        <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-[10px] font-black text-muted-foreground uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                     {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4" colSpan={5}><Skeleton className="h-12 w-full" /></td>
                                            </tr>
                                        ))
                                     ) : registrations.length > 0 ? (
                                        registrations.map(reg => (
                                            <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{reg.name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{reg.registration_code}</span>
                                                        {/* Mobile-only secondary info */}
                                                        <span className="text-[10px] text-primary sm:hidden truncate max-w-[150px] mt-0.5">{reg.college_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                                    <span className="text-xs font-medium text-muted-foreground line-clamp-1 max-w-[200px]">{reg.college_name}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(reg.Sports || []).map(s => (
                                                            <span key={s.id} className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded border">{s.name}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant={reg.checked_in ? 'default' : 'outline'} className={cn("text-[9px] px-1.5 h-5 w-fit capitalize", reg.checked_in && "bg-green-500 hover:bg-green-600")}>
                                                            {reg.checked_in ? 'Checked In' : 'Pending'}
                                                        </Badge>
                                                        {reg.kit_delivered && (
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 h-5 w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Kit OK</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold px-3">Manage</Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56">
                                                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground px-2 py-1.5">Pass Management</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handlePrintPass(reg.id)} className="cursor-pointer">
                                                                <Printer className="mr-2 h-4 w-4" />
                                                                <span className="font-medium">Print Participant Pass</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-muted-foreground px-2 py-1.5">Check-in Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleUpdateCheckinStatus(reg.id, { check_in_status: !reg.checked_in }, reg.name)} 
                                                                className={cn("cursor-pointer", reg.checked_in && "text-muted-foreground")}
                                                            >
                                                                <CheckCircle className={cn("mr-2 h-4 w-4", reg.checked_in ? "text-green-500" : "text-muted-foreground")} />
                                                                <span className="font-medium">{reg.checked_in ? 'Undo Check-in' : 'Mark as Checked-in'}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleUpdateCheckinStatus(reg.id, { kit_delivered: !reg.kit_delivered }, reg.name)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Package className={cn("mr-2 h-4 w-4", reg.kit_delivered ? "text-blue-500" : "text-muted-foreground")} />
                                                                <span className="font-medium">{reg.kit_delivered ? 'Undo Kit Delivery' : 'Mark Kit Delivered'}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleUpdateCheckinStatus(reg.id, { id_verified: !reg.id_verified }, reg.name)}
                                                                className="cursor-pointer"
                                                            >
                                                                <UserCheck className={cn("mr-2 h-4 w-4", reg.id_verified ? "text-emerald-500" : "text-muted-foreground")} />
                                                                <span className="font-medium">{reg.id_verified ? 'Undo ID Verification' : 'Verify ID Card'}</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                     ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-20">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Search className="h-10 w-10 mb-4 opacity-20" />
                                                    <p className="font-bold">No participants found</p>
                                                    <p className="text-xs">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                     )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}