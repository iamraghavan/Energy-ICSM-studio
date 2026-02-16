

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    getStudentTeamDetails, 
    deleteTeamMember, 
    updateTeamName, 
    deleteTeam, 
    type FullTeamDetails, 
    type StudentTeamMember 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Trash2, Edit, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AddMemberDialog } from './AddMemberDialog';
import { EditMemberDialog } from './EditMemberDialog';

export function ManageTeamClientPage({ teamId }: { teamId: string }) {
    const [team, setTeam] = useState<FullTeamDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<StudentTeamMember | null>(null);


    const { toast } = useToast();
    const router = useRouter();

    const fetchTeamDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const teamData = await getStudentTeamDetails(teamId);
            setTeam(teamData);
            setNewTeamName(teamData.team_name);
        } catch (err) {
            setError('Failed to fetch team details.');
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch team details.' });
        } finally {
            setIsLoading(false);
        }
    }, [teamId, toast]);

    useEffect(() => {
        fetchTeamDetails();
    }, [fetchTeamDetails]);

    const handleSuccess = () => {
        fetchTeamDetails();
    };

    const handleUpdateTeamName = async () => {
        if (!team || newTeamName === team.team_name) {
            setIsEditingName(false);
            return;
        }
        try {
            await updateTeamName(team.id, newTeamName);
            toast({ title: 'Success', description: 'Team name updated.' });
            handleSuccess();
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
    
    const handleRemovePlayer = async (memberId: string) => {
        try {
            await deleteTeamMember(memberId);
            toast({ title: 'Player Removed', description: 'The player has been removed from the team.' });
            handleSuccess();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to remove player.' });
        }
    };
    
    if (isLoading) {
        return (
             <div className="container py-8 space-y-6">
                <Skeleton className="h-10 w-48" />
                <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        )
    }

    if (error || !team) {
        return (
             <div className="container py-8 text-center">
                <p>{error || 'Team not found.'}</p>
                <Button variant="outline" onClick={() => router.push('/energy/2026/student/dashboard')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                </Button>
            </div>
        );
    }
    
    if (!team.Sport || !team.Members) {
        return (
             <div className="container py-8 text-center">
                <p className="text-destructive">Incomplete team data received. Cannot display page.</p>
                <Button variant="outline" onClick={() => router.push('/energy/2026/student/dashboard')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                </Button>
            </div>
        );
    }

    const memberCount = team.Members.length;
    const maxPlayers = team.Sport.max_players;
    const progressValue = (memberCount / maxPlayers) * 100;
    
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
                        <Button onClick={() => setIsAddMemberOpen(true)} disabled={memberCount >= maxPlayers}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Member
                        </Button>
                    </div>

                     <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Mobile</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.Members.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No members added yet.</TableCell></TableRow>
                                ) : team.Members.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">{member.mobile}</TableCell>
                                        <TableCell><Badge variant={member.role === 'Captain' ? 'default' : 'secondary'}>{member.role}</Badge></TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="ghost" size="icon" onClick={() => setEditingMember(member)}><Edit className="h-4 w-4" /></Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently remove the member from your team. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemovePlayer(member.id)}>Remove</AlertDialogAction>
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
                <CardFooter className="justify-end">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive">Delete Team</Button>
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

             <AddMemberDialog
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                teamId={team.id}
                sport={team.Sport}
                onSuccess={handleSuccess}
            />

            {editingMember && (
                <EditMemberDialog
                    isOpen={!!editingMember}
                    onClose={() => setEditingMember(null)}
                    member={editingMember}
                    sport={team.Sport}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
