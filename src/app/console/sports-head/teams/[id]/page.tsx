
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    getSportsHeadTeamDetails, 
    getSportsHeadStudents,
    addPlayerToTeam,
    removePlayerFromTeam,
    updateSportsHeadTeam,
    deleteSportsHeadTeam,
    type FullSportsHeadTeam, 
    type SportStudent,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Trash2, Edit, Save, Loader2, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

function AddPlayerDialog({ teamId, existingMemberIds, onPlayerAdded }: { teamId: string, existingMemberIds: string[], onPlayerAdded: () => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState<SportStudent[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getSportsHeadStudents()
                .then(data => {
                    const availableStudents = data.filter(s => !s.team_id && !existingMemberIds.includes(s.registration_id));
                    setStudents(availableStudents);
                })
                .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Could not load available students.' }))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, toast, existingMemberIds]);

    const handleAddPlayer = async () => {
        if (!selectedStudentId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a student to add.' });
            return;
        }
        setIsLoading(true);
        try {
            await addPlayerToTeam(teamId, selectedStudentId);
            toast({ title: 'Success', description: 'Player added to the team.' });
            onPlayerAdded();
            setIsOpen(false);
        } catch (error: any) {
            // As per backend, this will fail with a 501
            toast({ variant: 'destructive', title: 'Feature Not Available', description: error.response?.data?.message || 'The backend does not support adding players yet.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4"/> Add Player</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Player to Team</DialogTitle>
                    <DialogDescription>Select an unassigned player from the list to add to this team.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ScrollArea className="h-72">
                         {isLoading ? <p>Loading students...</p> : 
                            students.length > 0 ? (
                                <div className="space-y-2">
                                    {students.map(student => (
                                        <div 
                                            key={student.registration_id}
                                            onClick={() => setSelectedStudentId(student.registration_id)}
                                            className={`p-2 border rounded-md cursor-pointer ${selectedStudentId === student.registration_id ? 'bg-accent' : 'hover:bg-muted'}`}
                                        >
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.college}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No available players found.</p>
                            )
                        }
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleAddPlayer} disabled={isLoading || !selectedStudentId}>
                        {isLoading && <Loader2 className="animate-spin mr-2"/>} Add to Team
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function SportsHeadManageTeamPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.id as string;
    
    const [team, setTeam] = useState<FullSportsHeadTeam | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const { toast } = useToast();

    const fetchTeamDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSportsHeadTeamDetails(teamId);
            setTeam(data);
            setNewTeamName(data.team_name);
        } catch (error) {
            setError('Could not fetch team details.');
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchTeamDetails();
    }, [fetchTeamDetails]);

    const handleUpdateName = async () => {
        if (!team || newTeamName === team.team_name) {
            setIsEditingName(false);
            return;
        }
        try {
            await updateSportsHeadTeam(teamId, { team_name: newTeamName });
            toast({ title: 'Success', description: 'Team name updated.' });
            fetchTeamDetails();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update team name.' });
        } finally {
            setIsEditingName(false);
        }
    };
    
    const handleRemovePlayer = async (studentId: string) => {
        try {
            await removePlayerFromTeam(teamId, studentId);
            toast({ title: 'Player Removed', description: 'The player has been removed from the team.' });
            fetchTeamDetails();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to remove player.' });
        }
    }

    const handleDeleteTeam = async () => {
        try {
            await deleteSportsHeadTeam(teamId);
            toast({ title: 'Team Deleted', description: 'The team has been permanently deleted.' });
            router.push('/console/sports-head/teams');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to delete team.' });
        }
    }

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
                <p className="text-destructive">{error || 'Team not found'}</p>
                <Button variant="outline" onClick={() => router.push('/console/sports-head/teams')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Teams
                </Button>
            </div>
        )
    }
    
    return (
        <div className="container py-8 space-y-6">
            <div>
                 <Button variant="outline" onClick={() => router.push('/console/sports-head/teams')}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Teams
                </Button>
            </div>

            <Card>
                <CardHeader>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="text-2xl font-bold h-auto p-0 border-0 shadow-none focus-visible:ring-0" />
                            <Button size="icon" variant="ghost" onClick={handleUpdateName}><Save className="h-5 w-5" /></Button>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2">
                             <CardTitle className="text-3xl font-headline">{team.team_name}</CardTitle>
                             <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}><Edit className="h-5 w-5" /></Button>
                        </div>
                    )}
                    <CardDescription>{team.Sport.name}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                         <h3 className="text-xl font-semibold">Player Roster ({team.members.length})</h3>
                        <AddPlayerDialog teamId={team.id} existingMemberIds={team.members.map(m => m.student_id)} onPlayerAdded={fetchTeamDetails} />
                    </div>
                     <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {team.members.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center">No players in this team yet.</TableCell></TableRow>}
                                {team.members.map(member => (
                                    <TableRow key={member.student_id}>
                                        <TableCell className="font-medium">{member.Student.name}</TableCell>
                                        <TableCell>{member.Student.mobile}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><UserX className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove {member.Student.name}?</AlertDialogTitle>
                                                        <AlertDialogDescription>Are you sure you want to remove this player from the team?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemovePlayer(member.student_id)}>Confirm</AlertDialogAction>
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
                            <Button variant="destructive"><Trash2 className="mr-2"/> Delete Team</Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {team.team_name}?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the team. This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteTeam}>Yes, Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    )
}
