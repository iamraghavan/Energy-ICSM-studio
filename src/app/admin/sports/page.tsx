'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getSports, createSport, updateSport, deleteSport, type ApiSport } from '@/lib/api';
import { Loader2, MoreHorizontal, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const sportFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  type: z.enum(['Team', 'Individual']),
  min_players: z.coerce.number().optional(),
  max_players: z.coerce.number().min(1, 'Max players must be at least 1.'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative.'),
});

export default function SportManagementPage() {
  const [sports, setSports] = useState<ApiSport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<ApiSport | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sportFormSchema>>({
    resolver: zodResolver(sportFormSchema),
    defaultValues: { name: '', type: 'Individual', max_players: 1, amount: 0, min_players: 1 },
  });

  const sportType = form.watch('type');
  useEffect(() => {
    if (sportType === 'Individual') {
        form.setValue('min_players', 1);
        form.setValue('max_players', 1);
    }
  }, [sportType, form]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getSports();
      setSports(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch sports',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModalOpen = (sport: ApiSport | null = null) => {
    setSelectedSport(sport);
    if (sport) {
      form.reset({
        ...sport,
        amount: parseFloat(sport.amount)
      });
    } else {
      form.reset({ name: '', type: 'Individual', max_players: 1, amount: 0, min_players: 1 });
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSport(null);
    form.reset();
  };
  
  const handleDeleteConfirmOpen = (sport: ApiSport) => {
    setSelectedSport(sport);
    setIsConfirmOpen(true);
  }

  const handleDeleteSport = async () => {
    if (!selectedSport) return;
    try {
      await deleteSport(selectedSport.id);
      toast({ title: 'Sport deleted successfully!' });
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete sport',
      });
    } finally {
        setIsConfirmOpen(false);
        setSelectedSport(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof sportFormSchema>) => {
    try {
      if (selectedSport) {
        await updateSport(selectedSport.id, values);
        toast({ title: 'Sport updated successfully!' });
      } else {
        await createSport(values);
        toast({ title: 'Sport created successfully!' });
      }
      fetchData();
      handleModalClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation failed',
        description: error.response?.data?.message || 'An error occurred.',
      });
    }
  };

  return (
    <>
      <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Sports Management</CardTitle>
                <CardDescription>Add, edit, or remove sports for the event.</CardDescription>
            </div>
            <Button onClick={() => handleModalOpen()}>
              <Trophy className="mr-2" />
              Add Sport
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Players (Min/Max)</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className='text-right'><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && sports.map((sport) => (
                            <TableRow key={sport.id}>
                                <TableCell className="font-medium">{sport.name}</TableCell>
                                <TableCell><Badge variant="secondary">{sport.type}</Badge></TableCell>
                                <TableCell>{sport.min_players || 1} / {sport.max_players}</TableCell>
                                <TableCell>₹{sport.amount}</TableCell>
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
                                            <DropdownMenuItem onClick={() => handleModalOpen(sport)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDeleteConfirmOpen(sport)} className="text-destructive focus:text-destructive">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             {!isLoading && sports.length === 0 && (
                <div className='text-center py-16 text-muted-foreground'>
                    <p>No sports found.</p>
                </div>
            )}
        </CardContent>
      </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSport ? 'Edit Sport' : 'Add New Sport'}</DialogTitle>
            <DialogDescription>
              {selectedSport ? 'Update the details of the sport.' : 'Fill in the form to create a new sport.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Sport Name</FormLabel><FormControl><Input placeholder="e.g. Football" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Individual">Individual</SelectItem>
                                <SelectItem value="Team">Team</SelectItem>
                            </SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    {sportType === 'Team' && <FormField control={form.control} name="min_players" render={({ field }) => (
                        <FormItem><FormLabel>Min Players</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>}
                    <FormField control={form.control} name="max_players" render={({ field }) => (
                        <FormItem><FormLabel>Max Players</FormLabel><FormControl><Input type="number" {...field} disabled={sportType === 'Individual'} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Registration Fee (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedSport ? 'Save Changes' : 'Create Sport'}
                    </Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the sport <span className="font-semibold">{selectedSport?.name}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSport} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
