

'use client';
import { useEffect, useState, useMemo } from 'react';
import { getSportsHeadRegistrations, createSportsHeadTeam, type SportsHeadRegistration } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Search, X, Users, Eye, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

// Schema for the create team dialog form
const createTeamSchema = z.object({
  team_name: z.string().min(3, 'Team name must be at least 3 characters.'),
});

// Dialog component for creating a team for a specific student
function CreateTeamDialog({
  student,
  isOpen,
  onClose,
  onTeamCreated,
}: {
  student: SportsHeadRegistration | null;
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
  });

  useEffect(() => {
    if (student) {
      form.setValue('team_name', `${student.college_name} Team`);
    }
  }, [student, form]);

  const onSubmit = async (values: z.infer<typeof createTeamSchema>) => {
    if (!student) return;

    try {
      await createSportsHeadTeam({
        team_name: values.team_name,
        registration_id: student.id,
      });
      toast({
        title: 'Team Created!',
        description: `Team "${values.team_name}" has been created with ${student.name} as captain.`,
      });
      onTeamCreated();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create team',
        description: error.response?.data?.message || 'An error occurred.',
      });
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team for {student.name}</DialogTitle>
          <DialogDescription>
            You are creating a new team with {student.name} as the captain. The team will be associated with {student.college_name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="team_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Team
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function SportsHeadPlayersPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<SportsHeadRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // State for the dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SportsHeadRegistration | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getSportsHeadRegistrations();
      setRegistrations(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch player data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTeamCreated = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    fetchData(); // Refresh data
  };

  const handleOpenCreateTeamModal = (student: SportsHeadRegistration) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handleViewTeam = (teamId: string) => {
      router.push(`/console/sports-head/teams/${teamId}`);
  };


  const filteredRegistrations = useMemo(() => {
    return (registrations || []).filter(reg => {
      if (!reg || !reg.name) return false;
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      const searchMatch = lowerSearchTerm === '' ||
        reg.name.toLowerCase().includes(lowerSearchTerm) ||
        reg.college_name.toLowerCase().includes(lowerSearchTerm) ||
        reg.registration_code.toLowerCase().includes(lowerSearchTerm) ||
        (reg.email || '').toLowerCase().includes(lowerSearchTerm);

      return searchMatch;
    });
  }, [registrations, searchTerm]);

  const renderTable = () => {
      if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        )
      }
      if (error) {
        return <p className="text-destructive text-center py-10">{error}</p>;
      }
      if (filteredRegistrations.length === 0) {
        return <p className="text-muted-foreground text-center py-16">No players match your filters.</p>;
      }
      
      return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">College</TableHead>
                    <TableHead className="hidden lg:table-cell">Contact</TableHead>
                    <TableHead>Team Status</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                        <TableCell>
                            <div className="font-medium">{reg.name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground font-mono">{reg.registration_code}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{reg.college_name || 'N/A'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {reg.mobile && <div className="flex items-center gap-2 text-sm"><Phone className="h-3 w-3" /> {reg.mobile}</div>}
                          {reg.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-3 w-3" /> {reg.email}</div>}
                        </TableCell>
                        <TableCell>
                           {reg.team_info ? (
                               <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100/80">
                                   Team: {reg.team_info.name}
                                </Badge>
                           ) : (
                               <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">Pending Team</Badge>
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                           {reg.team_info ? (
                                <Button variant="outline" size="sm" onClick={() => handleViewTeam(reg.team_info!.id)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Team
                                </Button>
                           ) : (
                                <Button size="sm" onClick={() => handleOpenCreateTeamModal(reg)}>
                                    <Users className="mr-2 h-4 w-4" /> Create Team
                                </Button>
                           )}
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      )
  }

  const hasActiveFilters = !!searchTerm;
  
  const renderFilterBar = () => {
       if (isLoading) {
           return <Skeleton className="h-10 flex-1" />;
       }
       return (
             <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, college, email, code..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {hasActiveFilters && <Button variant="ghost" onClick={() => setSearchTerm('')}><X className="h-4 w-4 mr-2" />Clear</Button>}
            </div>
       )
  }

  return (
    <>
        <div className="container py-8 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Player Management</CardTitle>
                <CardDescription>View all approved players for your sport and manage their teams.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {renderFilterBar()}
                    {renderTable()}
                </div>
            </CardContent>
        </Card>
        </div>
        <CreateTeamDialog
            student={selectedStudent}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onTeamCreated={handleTeamCreated}
        />
    </>
  );
}



