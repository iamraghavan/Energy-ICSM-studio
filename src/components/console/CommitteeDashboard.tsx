
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Search, SlidersHorizontal, CheckCircle, Package, UserCheck, X, Printer } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getCommitteeRegistrations, updateCheckIn, type Registration, getSports, getCollegesAdmin, type ApiSport, type College, getPassHTML } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

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
    const [colleges, setColleges] = useState<(Omit<College, 'id'> & {id: number})[]>([]);
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
                const [sportsData, collegesData] = await Promise.all([getSports(), getCollegesAdmin()]);
                setSports(sportsData);
                setColleges(collegesData);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load filter options.' });
            }
        };
        fetchFilterOptions();
    }, [toast]);
    
    const handleUpdateCheckinStatus = async (registrationId: string, updateData: { checked_in?: boolean; kit_delivered?: boolean; id_verified?: boolean; }, name: string) => {
        try {
            await updateCheckIn(registrationId, updateData);
            setRegistrations(prev => 
                prev.map(reg => reg.id === registrationId ? { ...reg, ...updateData } : reg)
            );
            const actionText = updateData.checked_in ? 'Checked In' : updateData.kit_delivered ? 'Kit Delivered' : 'ID Verified';
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
            printWindow.focus(); 
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
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: '', sport_id: '', status: '', payment_status: '', college_id: '' });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <div className="container py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Participant Check-in & Management</CardTitle>
                    <CardDescription>Search for participants and manage their check-in status.</CardDescription>
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
                                    Filters
                                    {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-screen max-w-xs sm:max-w-sm md:max-w-md" align="end">
                                <div className="space-y-4 p-4">
                                     <h4 className="font-medium leading-none">Filter Registrations</h4>
                                     <div className="grid gap-4">
                                         <Select value={filters.sport_id} onValueChange={v => handleFilterChange('sport_id', v)}><SelectTrigger><SelectValue placeholder="All Sports" /></SelectTrigger><SelectContent>{sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select>
                                         <Select value={filters.college_id} onValueChange={v => handleFilterChange('college_id', v)}><SelectTrigger><SelectValue placeholder="All Colleges" /></SelectTrigger><SelectContent>{colleges.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select>
                                         <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}><SelectTrigger><SelectValue placeholder="Reg. Status" /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
                                         <Select value={filters.payment_status} onValueChange={v => handleFilterChange('payment_status', v)}><SelectTrigger><SelectValue placeholder="Payment Status" /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="verified">Verified</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
                                        {hasActiveFilters && <Button variant="ghost" onClick={clearFilters}><X className="mr-2 h-4 w-4" />Clear All Filters</Button>}
                                     </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                       <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">College</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sports</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background divide-y divide-gray-200">
                                     {isLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4" colSpan={5}><Skeleton className="h-12 w-full" /></td>
                                            </tr>
                                        ))
                                     ) : registrations.length > 0 ? (
                                        registrations.map(reg => (
                                            <tr key={reg.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium">{reg.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{reg.registration_code}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{reg.college_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{(reg.Sports || []).map(s => s.name).join(', ')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5">
                                                        <Badge variant={reg.status === 'approved' ? 'default' : 'secondary'} className="capitalize w-fit">Reg: {reg.status}</Badge>
                                                        <Badge variant={reg.payment_status === 'verified' || reg.payment_status === 'approved' ? 'default' : reg.payment_status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize w-fit">Pay: {reg.payment_status}</Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Manage</Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handlePrintPass(reg.id)}>
                                                                <Printer className="mr-2 h-4 w-4" />
                                                                <span>Print Pass</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel>Check-in Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleUpdateCheckinStatus(reg.id, { checked_in: !reg.checked_in }, reg.name)} disabled={reg.checked_in}>
                                                                <CheckCircle className="mr-2 h-4 w-4" /><span>{reg.checked_in ? 'Checked In' : 'Check In'}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateCheckinStatus(reg.id, { kit_delivered: !reg.kit_delivered }, reg.name)} disabled={reg.kit_delivered}>
                                                                <Package className="mr-2 h-4 w-4" /><span>{reg.kit_delivered ? 'Kit Delivered' : 'Deliver Kit'}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateCheckinStatus(reg.id, { id_verified: !reg.id_verified }, reg.name)} disabled={reg.id_verified}>
                                                                <UserCheck className="mr-2 h-4 w-4" /><span>{reg.id_verified ? 'ID Verified' : 'Verify ID'}</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                     ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16 text-muted-foreground">No registrations match your criteria.</td>
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
