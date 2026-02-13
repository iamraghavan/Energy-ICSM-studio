'use client';
import { useEffect, useState, useMemo } from 'react';
import { getRegistrations, verifyPayment, type Registration, getSports, getColleges, type ApiSport, type College } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { VerifyPaymentModal } from '@/components/console/admin/VerifyPaymentModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, MoreHorizontal, Search, X, Eye } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function AllRegistrationsPage() {
  const router = useRouter();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sports, setSports] = useState<ApiSport[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { toast } = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sport: '',
    college: '',
    paymentStatus: '',
    registrationStatus: ''
  });
  const [date, setDate] = useState<DateRange | undefined>();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [regData, sportsData, collegeData] = await Promise.all([
        getRegistrations(),
        getSports(),
        getColleges()
      ]);
      setRegistrations(regData);
      setSports(sportsData);
      setColleges(collegeData.filter(c => c.id !== 'other')); // Exclude 'Other' option
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
  }, []);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ sport: '', college: '', paymentStatus: '', registrationStatus: '' });
    setDate(undefined);
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const searchMatch = searchTerm.toLowerCase() === '' ||
        reg.Student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reg.Student.other_college || reg.Student.College?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reg.Sport?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registration_code.toLowerCase().includes(searchTerm.toLowerCase());

      const sportMatch = !filters.sport || String(reg.sport_id) === filters.sport;
      const collegeMatch = !filters.college || reg.Student.college_id === filters.college;
      const paymentStatusMatch = !filters.paymentStatus || reg.payment_status === filters.paymentStatus;
      const registrationStatusMatch = !filters.registrationStatus || reg.status === filters.registrationStatus;

      const regDate = new Date(reg.created_at);
      const dateMatch = !date || (
        (!date.from || regDate >= date.from) &&
        (!date.to || regDate <= date.to)
      );

      return searchMatch && sportMatch && collegeMatch && paymentStatusMatch && registrationStatusMatch && dateMatch;
    });
  }, [registrations, searchTerm, filters, date]);


  const handleVerifyClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleVerification = async (registrationCode: string, status: 'approved' | 'rejected', remarks: string) => {
    try {
      await verifyPayment(registrationCode, status, remarks);
      toast({
        title: 'Success',
        description: `Registration status updated to ${status}.`,
      });
      fetchData(); // Refresh the list
      handleModalClose();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: err.response?.data?.message || 'Could not update status.',
      });
    }
  };

  const handleViewDetailsClick = (registrationCode: string) => {
    router.push(`/admin/registrations/${encodeURIComponent(registrationCode)}`);
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
      if (filteredRegistrations.length === 0) {
        return <p className="text-muted-foreground text-center py-16">No registrations match your filters.</p>;
      }
      
      return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden lg:table-cell">College</TableHead>
                    <TableHead className="hidden md:table-cell">Sport</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                        <TableCell>
                            <div className="font-medium">{reg.Student.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{reg.registration_code}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{reg.Student.other_college || reg.Student.College?.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{reg.Sport?.name}</TableCell>
                        <TableCell className="hidden lg:table-cell">{format(new Date(reg.created_at), 'PPP')}</TableCell>
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
                        <TableCell>
                             <Badge
                                variant={
                                    reg.status === 'approved'
                                    ? 'default'
                                    : reg.status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="capitalize"
                                >
                                {reg.status}
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
                                    <DropdownMenuItem onClick={() => handleViewDetailsClick(reg.registration_code)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                    {reg.payment_status === 'pending' && (
                                        <DropdownMenuItem onClick={() => handleVerifyClick(reg)}>
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

  const hasActiveFilters = searchTerm || filters.sport || filters.college || filters.paymentStatus || filters.registrationStatus || date;

  const renderFilterBar = () => {
       if (isLoading) {
           return (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-2">
                         <Skeleton className="h-10 flex-1" />
                        <div className="grid grid-cols-2 sm:flex gap-2">
                             <Skeleton className="h-10 w-24" />
                             <Skeleton className="h-10 w-24" />
                             <Skeleton className="h-10 w-24" />
                             <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
           )
       }
       return (
             <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, code, sport..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div className="grid grid-cols-2 sm:flex gap-2">
                     <Select value={filters.sport} onValueChange={(v) => handleFilterChange('sport', v)}>
                        <SelectTrigger className="w-full sm:w-auto"><SelectValue placeholder="Sport" /></SelectTrigger>
                        <SelectContent>
                            {sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.college} onValueChange={(v) => handleFilterChange('college', v)}>
                        <SelectTrigger className="w-full sm:w-auto"><SelectValue placeholder="College" /></SelectTrigger>
                        <SelectContent>
                            {colleges.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filters.paymentStatus} onValueChange={(v) => handleFilterChange('paymentStatus', v)}>
                        <SelectTrigger className="w-full sm:w-auto"><SelectValue placeholder="Payment" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-auto justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                                ) : (
                                format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="range"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {hasActiveFilters && <Button variant="ghost" onClick={clearFilters}><X className="h-4 w-4 mr-2" />Clear</Button>}
                </div>
            </div>
       )
  }

  return (
    <>
    <div className="container py-8">
      <Card>
        <CardHeader>
            <CardTitle>All Registrations</CardTitle>
            <CardDescription>View, filter, and verify student registrations and payments.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {renderFilterBar()}
                {renderTable()}
            </div>
        </CardContent>
      </Card>
      </div>
      {selectedRegistration && (
          <VerifyPaymentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          registration={selectedRegistration}
          onVerify={handleVerification}
          />
      )}
    </>
  );
}
