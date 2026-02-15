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
import { getUsers, createUser, updateUser, deleteUser, type User, getSports, type ApiSport } from '@/lib/api';
import { Loader2, MoreHorizontal, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const baseUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  email: z.string().email('Invalid email address.'),
  role: z.enum(['super_admin', 'sports_head', 'scorer', 'committee']),
  assigned_sport_id: z.string().optional(),
});

const createUserFormSchema = baseUserSchema.extend({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
}).refine(data => {
    if (data.role === 'sports_head') {
        return !!data.assigned_sport_id;
    }
    return true;
}, {
    message: 'Please assign a sport for the Sports Head role.',
    path: ['assigned_sport_id'],
});

const editUserFormSchema = baseUserSchema.refine(data => {
    if (data.role === 'sports_head') {
        return !!data.assigned_sport_id;
    }
    return true;
}, {
    message: 'Please assign a sport for the Sports Head role.',
    path: ['assigned_sport_id'],
});

type UserFormData = z.infer<typeof createUserFormSchema>;


const roles: { id: User['role'], name: string }[] = [
    { id: 'super_admin', name: 'Super Admin' },
    { id: 'sports_head', name: 'Sports Head' },
    { id: 'scorer', name: 'Scorer' },
    { id: 'committee', name: 'Committee' },
]

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sports, setSports] = useState<ApiSport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(selectedUser ? editUserFormSchema : createUserFormSchema),
    defaultValues: {
        name: '',
        email: '',
        username: '',
        role: undefined,
        password: '',
        assigned_sport_id: undefined,
    },
  });

  const role = form.watch('role');
  const email = form.watch('email');

  useEffect(() => {
    if (email && !selectedUser) {
        const suggestedUsername = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
        form.setValue('username', suggestedUsername);
    }
  }, [email, selectedUser, form]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch users',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSports = async () => {
      try {
          const data = await getSports();
          setSports(data);
      } catch (error) {
           toast({
                variant: 'destructive',
                title: 'Failed to fetch sports',
                description: 'Could not load sports list for assignment.',
            });
      }
  }

  useEffect(() => {
    fetchUsers();
    fetchSports();
  }, []);

  const handleModalOpen = (user: User | null = null) => {
    setSelectedUser(user);
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        password: '',
        assigned_sport_id: user.assigned_sport_id ? String(user.assigned_sport_id) : undefined,
      });
    } else {
      form.reset({ name: '', email: '', username: '', role: undefined, password: '', assigned_sport_id: undefined });
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    form.reset();
  };
  
  const handleDeleteConfirmOpen = (user: User) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      toast({ title: 'User deleted successfully!' });
      fetchUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete user',
      });
    } finally {
        setIsConfirmOpen(false);
        setSelectedUser(null);
    }
  };

  const onSubmit = async (values: UserFormData) => {
    const apiValues: any = {...values};
    if (apiValues.role === 'sports_head' && apiValues.assigned_sport_id) {
        apiValues.assigned_sport_id = parseInt(apiValues.assigned_sport_id, 10);
    } else {
        delete apiValues.assigned_sport_id;
    }
    
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, { name: apiValues.name, email: apiValues.email, role: apiValues.role, assigned_sport_id: apiValues.assigned_sport_id });
        toast({ title: 'User updated successfully!' });
      } else {
        await createUser(apiValues);
        toast({ title: 'User created successfully!' });
      }
      fetchUsers();
      handleModalClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Operation failed',
        description: error.response?.data?.message || 'An error occurred.',
      });
    }
  };

  const getSportName = (sportId: number | null | undefined): string => {
    if (!sportId || sports.length === 0) return '';
    const sport = sports.find(s => s.id === sportId);
    return sport ? `(${sport.name})` : '';
  }


  return (
    <>
      <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add, edit, or remove console users.</CardDescription>
            </div>
            <Button onClick={() => handleModalOpen()}>
              <UserPlus className="mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className='text-right'><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                    {user.role.replace('_', ' ')}
                                </Badge>
                                 {user.role === 'sports_head' && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {getSportName(user.assigned_sport_id)}
                                    </span>
                                )}
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
                                            <DropdownMenuItem onClick={() => handleModalOpen(user)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDeleteConfirmOpen(user)} className="text-destructive focus:text-destructive">
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
             {!isLoading && users.length === 0 && (
                <div className='text-center py-16 text-muted-foreground'>
                    <p>No users found.</p>
                </div>
            )}
        </CardContent>
      </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Update the details of the user.' : 'Fill in the form to create a new user.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter full name" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              {!selectedUser && (
                <>
                <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Enter username" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Min. 8 characters" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                </>
              )}
               <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                {role === 'sports_head' && (
                    <FormField
                        control={form.control}
                        name="assigned_sport_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assigned Sport</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a sport to assign" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sports.map(sport => (
                                            <SelectItem key={sport.id} value={String(sport.id)}>{sport.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedUser ? 'Save Changes' : 'Create User'}
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
                This action cannot be undone. This will permanently delete the user <span className="font-semibold">{selectedUser?.name}</span> and remove their access to the console.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
