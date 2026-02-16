

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    getSportsHeadTeamDetails, 
    removePlayerFromTeam,
    updateSportsHeadTeam,
    deleteSportsHeadTeam,
    type FullSportsHeadTeam, 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Trash2, Edit, Save, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { AddPlayerDialog } from '@/components/console/sports-head/AddPlayerDialog';
import { EditPlayerDialog } from '@/components/console/sports-head/EditPlayerDialog';
import type { StudentTeamMember } from '@/lib/api';
import { Badge } from '@/components/ui/badge';


export default function SportsHeadManageTeamPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.id as string;
    
    const [team, setTeam] = useState<FullSportsHeadTeam | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [isEditPlayerOpen, setIsEditPlayerOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<StudentTeamMember | null>(null);
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

    const handleEditPlayer = (player: StudentTeamMember) => {
        setSelectedPlayer(player);
        setIsEditPlayerOpen(true);
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
                         <h3 className="text-xl font-semibold">Player Roster ({team.members.length} / {team.Sport.max_players})</h3>
                        <Button onClick={() => setIsAddPlayerOpen(true)} disabled={team.members.length >= team.Sport.max_players}>
                            <UserPlus className="mr-2 h-4 w-4"/> Add Player
                        </Button>
                    </div>
                     <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {team.members.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No players in this team yet.</TableCell></TableRow>}
                                {team.members.map(member => (
                                    <TableRow key={member.student_id}>
                                        <TableCell className="font-medium">{member.Student?.name}</TableCell>
                                        <TableCell>{member.Student?.mobile}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <Badge variant={member.role === 'Captain' ? 'default' : 'secondary'} className="w-fit">{member.role}</Badge>
                                                {member.sport_role && <span className="text-xs text-muted-foreground">{member.sport_role}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="ghost" size="icon" onClick={() => handleEditPlayer(member)}>
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><UserX className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove {member.Student?.name}?</AlertDialogTitle>
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
             <AddPlayerDialog
                isOpen={isAddPlayerOpen}
                onClose={() => setIsAddPlayerOpen(false)}
                teamId={teamId}
                onSuccess={fetchTeamDetails}
            />
            {selectedPlayer && team.Sport && (
                 <EditPlayerDialog
                    isOpen={isEditPlayerOpen}
                    onClose={() => setIsEditPlayerOpen(false)}
                    teamId={teamId}
                    player={selectedPlayer}
                    sport={team.Sport}
                    onSuccess={fetchTeamDetails}
                />
            )}
        </div>
    )
}
