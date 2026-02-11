'use client';
import { useEffect, useState } from 'react';
import { getRegistrations, verifyPayment, type Registration } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { VerifyPaymentModal } from './VerifyPaymentModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function AllRegistrations() {
  const params = useParams();
  const viewId = params.viewId as string;
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registrations.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to fetch registrations.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

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
      fetchRegistrations(); // Refresh the list
      handleModalClose();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: err.response?.data?.message || 'Could not update status.',
      });
    }
  };
  
  const filteredRegistrations = (status: 'pending' | 'verified' | 'rejected' | 'approved' | 'all') => {
      if (status === 'all') return registrations;
      if (!registrations) return [];
      if (status === 'approved') {
        return registrations.filter(r => r.payment_status === 'approved' || r.payment_status === 'verified');
      }
      return registrations.filter(r => r.payment_status === status);
  }

  const renderTable = (data: Registration[]) => {
      if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
        )
      }
      if (error) {
        return <p className="text-destructive text-center">{error}</p>;
      }
      if (data.length === 0) {
        return <p className="text-muted-foreground text-center pt-8">No registrations found for this status.</p>;
      }
      
      return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.map((reg) => (
                    <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.Student.name}</TableCell>
                    <TableCell>{reg.Student.other_college}</TableCell>
                    <TableCell>{reg.Sport?.name}</TableCell>
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
                        <div className="flex justify-end gap-2">
                            {reg.payment_status === 'pending' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerifyClick(reg)}
                            >
                                Verify
                            </Button>
                            )}
                            <Button asChild variant="ghost" size="sm">
                                <Link href={`/console/${viewId}/registrations/${reg.id}`}>Details</Link>
                            </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      )
  }

  return (
    <>
        <Tabs defaultValue="pending">
            <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">{renderTable(filteredRegistrations('pending'))}</TabsContent>
            <TabsContent value="approved">{renderTable(filteredRegistrations('approved'))}</TabsContent>
            <TabsContent value="rejected">{renderTable(filteredRegistrations('rejected'))}</TabsContent>
            <TabsContent value="all">{renderTable(filteredRegistrations('all'))}</TabsContent>
        </Tabs>

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
