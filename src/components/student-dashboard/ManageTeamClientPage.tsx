
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/app/energy/2026/student/dashboard/layout';
import { bulkAddTeamMembers, bulkDeleteTeamMembers, updateTeamName, deleteTeam, deleteTeamMember, type StudentTeamMember, type FullTeamDetails } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Trash2, Edit, Save, Upload, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { MemberFormDialog } from './MemberFormDialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';

const bulkAddSchema = z.object({
  membersJson: z.string().refine(val => {
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) && parsed.every(item => 
            typeof item.name === 'string' &&
            typeof item.email === 'string' &&
            typeof item.mobile === 'string'
        );
    } catch {
        return false;
    }
  }, { message: 'Invalid JSON format. Must be an array of member objects with name, email, and mobile.' }),
});

function BulkAddDialog({ teamId, onSuccess }: { teamId: string, onSuccess: () => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof bulkAddSchema>>({
        resolver: zodResolver(bulkAddSchema),
        defaultValues: { membersJson: '[\n  {\n    "name": "Player One",\n    "email": "player1@example.com",\n    "mobile": "9876543210",\n    "role": "Player"\n  }\n]' },
    });

    const onSubmit = async (values: z.infer<typeof bulkAddSchema>) => {
        try {
            const members = JSON.parse(values.membersJson);
            await bulkAddTeamMembers(teamId, members);
            toast({ title: "Bulk Add Successful", description: `${members.length} members have been added.` });
            onSuccess();
            setIsOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Bulk Add Failed', description: error.response?.data?.message || 'An error occurred.' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Add</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bulk Add Members</DialogTitle>
                    <DialogDescription>Paste a JSON array of member objects to add them in bulk.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="membersJson" render={({ field }) => (
                            <FormItem>
                                <Label>Members JSON</Label>
                                <FormControl>
                                    <Textarea {...field} rows={10} placeholder='[{"name": "...", "email": "...", "mobile": "..."}]' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>Submit</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function ManageTeamClientPage({ teamId }: { teamId: string }) {
    const { dashboardData, isLoading: isDashboardLoading, refetch } = useDashboard();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<StudentTeamMember | null>(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    const { toast } = useToast();
    const router = useRouter();

    const team = useMemo(() => {
        if (!dashboardData) return null;
        return dashboardData.teams.find(t => t.id === teamId) || null;
    }, [dashboardData, teamId]);

    useEffect(() => {
        if (team) {
            setNewTeamName(team.team_name);
        }
    }, [team]);

    const handleUpdateTeamName = async () => {
        if (!team || newTeamName === team.team_name) {
            setIsEditingName(false);
            return;
        }
        try {
            await updateTeamName(team.id, newTeamName);
            toast({ title: 'Success', description: 'Team name updated.' });
            refetch(); // Refetch all dashboard data
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update team name.' });
        } finally {
            setIsEditingName(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!team) return;
        try {
            await deleteTeam(team.id);
            toast({ title: 'Success', description: 'Team deleted successfully.' });
            router.push('/energy/2026/student/dashboard');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete team.' });
        }
    };
    
    const handleDeleteMember = async (memberId: string) => {
        try {
            await deleteTeamMember(memberId);
            toast({ title: 'Success', description: 'Team member removed.' });
            refetch();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove member.' });
        }
    };
    
    const handleBulkDelete = async () => {
        if (selectedMemberIds.length === 0) return;
        try {
            await bulkDeleteTeamMembers(selectedMemberIds);
            toast({ title: "Bulk Delete Successful", description: `${selectedMemberIds.length} members removed.` });
            setSelectedMemberIds([]);
            refetch();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Bulk Delete Failed', description: 'Could not remove members.' });
        }
    };

    const handleOpenForm = (member: StudentTeamMember | null) => {
        setSelectedMember(member);
        setIsFormOpen(true);
    };

    const handleSelectMember = (memberId: string, isSelected: boolean) => {
        setSelectedMemberIds(prev => isSelected ? [...prev, memberId] : prev.filter(id => id !== memberId));
    };

    if (isDashboardLoading) {
        return (
            <div className="container py-8 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        );
    }
    
    if (!team) {
        return (
             <div className="container py-8 text-center">
                <p>Team not found or data is still loading...</p>
                <Button variant="outline" onClick={() => router.push('/energy/2026/student/dashboard')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                </Button>
            </div>
        );
    }
    
    const memberCount = team.Members.length;
    const maxPlayers = team.Sport.max_players;
    const progressValue = (memberCount / maxPlayers) * 100;
    const allMembersSelected = selectedMemberIds.length === team.Members.length && team.Members.length > 0;

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => router.push('/energy/2026/student/dashboard')}><ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard</Button>
            
            <Card>
                <CardHeader>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="text-2xl font-bold h-auto p-0 border-0 shadow-none focus-visible:ring-0" />
                            <Button size="icon" variant="ghost" onClick={handleUpdateTeamName}><Save className="h-5 w-5" /></Button>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2">
                             <CardTitle className="text-3xl font-headline">{team.team_name}</CardTitle>
                             <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}><Edit className="h-5 w-5" /></Button>
                        </div>
                    )}
                    <CardDescription>{team.Sport.name} ({team.Sport.category})</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <p className="font-medium">Team Progress</p>
                            <p>{memberCount} / {maxPlayers} players</p>
                        </div>
                        <Progress value={progressValue} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h3 className="text-xl font-semibold">Team Roster</h3>
                        <div className="flex gap-2">
                            {selectedMemberIds.length > 0 ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedMemberIds.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete {selectedMemberIds.length} members?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleBulkDelete}>Confirm Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <>
                                 <BulkAddDialog teamId={team.id} onSuccess={refetch} />
                                <Button onClick={() => handleOpenForm(null)} disabled={memberCount >= maxPlayers}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Member
                                </Button>
                                </>
                            )}
                        </div>
                    </div>

                     <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            checked={allMembersSelected} 
                                            onCheckedChange={(checked) => setSelectedMemberIds(checked ? team.Members.map(m => m.id) : [])}
                                            aria-label="Select all rows"
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.Members.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">No members added yet.</TableCell></TableRow>
                                ) : team.Members.map(member => (
                                    <TableRow key={member.id} data-state={selectedMemberIds.includes(member.id) && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedMemberIds.includes(member.id)}
                                                onCheckedChange={(checked) => handleSelectMember(member.id, !!checked)}
                                                aria-label={`Select row for ${member.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{member.email}</TableCell>
                                        <TableCell><Badge variant={member.role === 'Captain' ? 'default' : 'secondary'}>{member.role}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(member)}><Edit className="h-4 w-4" /></Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete {member.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently remove the member from your team. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" className="ml-auto">Delete Team</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this team?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{team.team_name}" and all its members. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive hover:bg-destructive/90">Yes, Delete Team</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>

            <MemberFormDialog 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                teamId={team.id}
                sportName={team.Sport.name}
                existingMember={selectedMember}
                onSuccess={refetch}
            />
        </div>
    );
}
