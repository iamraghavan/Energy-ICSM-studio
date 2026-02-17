

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    getSportsHeadTeamDetails, 
    removePlayerFromTeam,
    updateSportsHeadTeam,
    deleteSportsHeadTeam,
    type FullSportsHeadTeam, 
    type StudentTeamMember, 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Trash2, Edit, Save, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { EditPlayerDialog } from '@/components/console/sports-head/EditPlayerDialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BulkAddPlayersDialog } from '@/components/console/sports-head/BulkAddPlayersDialog';


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

    const memberCount = team.members.length;
    const maxPlayers = team.Sport.max_players;
    const progressValue = maxPlayers > 0 ? (memberCount / maxPlayers) * 100 : 0;
    
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
                    <div className="mb-4">
                         <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Team Progress</span>
                            <span>{memberCount} / {maxPlayers} Players</span>
                        </div>
                        <Progress value={progressValue} />
                    </div>

                    <div className="flex items-center justify-between my-6">
                         <h3 className="text-xl font-semibold">Player Roster</h3>
                        <div className="flex gap-2">
                            <Button onClick={() => setIsAddPlayerOpen(true)} disabled={memberCount >= maxPlayers}>
                                <UserPlus className="mr-2 h-4 w-4"/> Add Bulk Players
                            </Button>
                             <Button variant="outline" disabled>
                                <Upload className="mr-2 h-4 w-4"/> Upload via Excel
                            </Button>
                        </div>
                    </div>
                     <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Player</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="hidden sm:table-cell">Sport Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {team.members.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No players in this team yet.</TableCell></TableRow>}
                                {team.members.map(member => (
                                    <TableRow key={member.student_id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{member.Student?.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{member.Student?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.role === 'Captain' ? 'default' : 'secondary'} className="w-fit">{member.role}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{member.sport_role || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="ghost" size="icon" onClick={() => handleEditPlayer(member)}>
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" disabled={member.role === 'Captain'}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
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

            {team && (
                 <BulkAddPlayersDialog
                    team={team}
                    isOpen={isAddPlayerOpen}
                    onClose={() => setIsAddPlayerOpen(false)}
                    onSuccess={fetchTeamDetails}
                />
            )}

            {selectedPlayer && team.Sport && (
                 <EditPlayerDialog
                    isOpen={isEditPlayerOpen}
                    onClose={() => setSelectedPlayer(null)}
                    teamId={teamId}
                    player={selectedPlayer}
                    sport={team.Sport}
                    onSuccess={fetchTeamDetails}
                />
            )}
        </div>
    )
}
