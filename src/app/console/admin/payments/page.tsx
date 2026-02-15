'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPayments, type Registration, getSports, type ApiSport } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, X, Eye, CreditCard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AllPaymentsPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Registration[]>([]);
  const [sports, setSports] = useState<ApiSport[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    sport_id: '',
    status: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, sportsData] = await Promise.all([
        getPayments(filters),
        getSports()
      ]);
      setPayments(paymentsData || []);
      setSports(sportsData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to fetch initial data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value === 'all' ? '' : value }));
  };

  const clearFilters = () => {
    setFilters({ sport_id: '', status: '' });
  };
  
  const handleVerifyClick = (registrationId: string) => {
    router.push(`/console/admin/payments/verify?id=${registrationId}`);
  };

  const handleViewDetailsClick = (registrationId: string) => {
    router.push(`/console/admin/registrations/details?id=${registrationId}`);
  };

  const renderTable = () => {
      if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        )
      }
      if (error) {
        return <p className="text-destructive text-center py-10">{error}</p>;
      }
      if (payments.length === 0) {
        return <p className="text-muted-foreground text-center py-16">No payments match your filters.</p>;
      }
      
      return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Sport(s)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {payments.map((reg) => (
                    <TableRow key={reg.id}>
                        <TableCell>
                            <div className="font-medium">{reg.name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground font-mono">{reg.registration_code}</div>
                        </TableCell>
                        <TableCell>{reg.college_name || 'N/A'}</TableCell>
                        <TableCell>₹{reg.Payment?.amount || '0.00'}</TableCell>
                        <TableCell>
                           {(reg.Sports || []).filter(s => s?.name).map(s => s.name).join(', ')}
                        </TableCell>
                        <TableCell>{format(new Date(reg.created_at), 'PPP')}</TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    reg.payment_status === 'verified' || reg.payment_status === 'approved'
                                    ? 'default'
                                    : reg.payment_status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="capitalize"
                            >
                                {reg.payment_status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleViewDetailsClick(reg.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                    {reg.payment_status === 'pending' && (
                                        <DropdownMenuItem onClick={() => handleVerifyClick(reg.id)}>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Verify Payment
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      )
  }

  const hasActiveFilters = filters.sport_id || filters.status;
  
  const renderFilterBar = () => {
       if (isLoading && payments.length === 0) {
           return (
                <div className="flex gap-2">
                     <Skeleton className="h-10 w-32" />
                     <Skeleton className="h-10 w-32" />
                </div>
           )
       }
       return (
             <div className="flex flex-col md:flex-row gap-2">
                 <div className="grid grid-cols-2 sm:flex gap-2">
                     <Select value={filters.sport_id} onValueChange={(v) => handleFilterChange('sport_id', v)}>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Sports" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sports</SelectItem>
                            {sports.map(s => s && <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && <Button variant="ghost" onClick={clearFilters}><X className="h-4 w-4 mr-2" />Clear</Button>}
                </div>
            </div>
       )
  }

  return (
    <>
    <div className="container py-8 space-y-6">
       <div className="flex items-center justify-between">
            <div>
                 <h1 className="text-3xl font-bold">Payment Management</h1>
                <p className="text-muted-foreground">Filter, view, and verify payments for all registrations.</p>
            </div>
        </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filter Payments</CardTitle>
                <CardDescription>Narrow down payments by status or sport.</CardDescription>
              </div>
               {renderFilterBar()}
          </div>
        </CardHeader>
        <CardContent>
            {renderTable()}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
