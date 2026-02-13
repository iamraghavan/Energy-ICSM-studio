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
  DialogTrigger,
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getCollegesAdmin, createCollege, updateCollege, deleteCollege, bulkCreateColleges, type College } from '@/lib/api';
import { Loader2, MoreHorizontal, Building, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const collegeFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
});

const bulkCollegeSchema = z.string().refine(val => {
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) && parsed.every(item => 
            typeof item.name === 'string' &&
            typeof item.city === 'string' &&
            typeof item.state === 'string'
        );
    } catch {
        return false;
    }
}, { message: 'Invalid JSON format or structure. Must be an array of {name, city, state} objects.' });

export default function CollegeManagementPage() {
  const [colleges, setColleges] = useState<(Omit<College, 'id'> & {id: number})[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<(Omit<College, 'id'> & {id: number}) | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof collegeFormSchema>>({
    resolver: zodResolver(collegeFormSchema),
    defaultValues: { name: '', city: '', state: '' },
  });
  
  const bulkForm = useForm<{jsonData: string}>({
    resolver: zodResolver(z.object({jsonData: bulkCollegeSchema})),
    defaultValues: { jsonData: '[\n  {\n    "name": "Example College",\n    "city": "Example City",\n    "state": "Example State"\n  }\n]' },
  });


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getCollegesAdmin();
      setColleges(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch colleges',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModalOpen = (college: (Omit<College, 'id'> & {id: number}) | null = null) => {
    setSelectedCollege(college);
    if (college) {
      form.reset(college);
    } else {
      form.reset({ name: '', city: '', state: '' });
    }
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setSelectedCollege(null);
    form.reset();
  };
  
  const handleDeleteConfirmOpen = (college: (Omit<College, 'id'> & {id: number})) => {
    setSelectedCollege(college);
    setIsConfirmOpen(true);
  }

  const handleDeleteCollege = async () => {
    if (!selectedCollege) return;
    try {
      await deleteCollege(selectedCollege.id);
      toast({ title: 'College deleted successfully!' });
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete college',
      });
    } finally {
        setIsConfirmOpen(false);
        setSelectedCollege(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof collegeFormSchema>) => {
    try {
      if (selectedCollege) {
        await updateCollege(selectedCollege.id, values);
        toast({ title: 'College updated successfully!' });
      } else {
        await createCollege(values);
        toast({ title: 'College created successfully!' });
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
  
  const onBulkSubmit = async (values: {jsonData: string}) => {
    try {
      const collegesToCreate = JSON.parse(values.jsonData);
      await bulkCreateColleges(collegesToCreate);
      toast({ title: 'Bulk import successful!', description: `${collegesToCreate.length} colleges added.` });
      fetchData();
      setIsBulkModalOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Bulk import failed',
        description: error.response?.data?.message || 'An error occurred.',
      });
    }
  }

  return (
    <>
      <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>College Management</CardTitle>
                <CardDescription>Add, edit, or remove colleges.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
                    <Upload className="mr-2" />
                    Bulk Import
                </Button>
                <Button onClick={() => handleModalOpen()}>
                  <Building className="mr-2" />
                  Add College
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell className='text-right'><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && colleges.map((college) => (
                            <TableRow key={college.id}>
                                <TableCell className="font-medium">{college.name}</TableCell>
                                <TableCell>{college.city}</TableCell>
                                <TableCell>{college.state}</TableCell>
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
                                            <DropdownMenuItem onClick={() => handleModalOpen(college)}>Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDeleteConfirmOpen(college)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             {!isLoading && colleges.length === 0 && (
                <div className='text-center py-16 text-muted-foreground'>
                    <p>No colleges found.</p>
                </div>
            )}
        </CardContent>
      </Card>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedCollege ? 'Edit College' : 'Add New College'}</DialogTitle>
            <DialogDescription>
              Fill in the form to {selectedCollege ? 'update the' : 'create a new'} college.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>College Name</FormLabel><FormControl><Input placeholder="Enter college name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Enter city" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="Enter state" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {selectedCollege ? 'Save Changes' : 'Create College'}
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
            <DialogTitle>Bulk Import Colleges</DialogTitle>
            <DialogDescription>
              Paste a JSON array of college objects. Each object must have `name`, `city`, and `state` properties.
            </DialogDescription>
          </DialogHeader>
           <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-4 py-4">
                     <FormField control={bulkForm.control} name="jsonData" render={({ field }) => (
                        <FormItem>
                            <FormLabel>College JSON Data</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Paste JSON here" {...field} className="h-48 font-mono" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                     <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={bulkForm.formState.isSubmitting}>
                            {bulkForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Import Colleges
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
                This will permanently delete the college: <span className="font-semibold">{selectedCollege?.name}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCollege} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
