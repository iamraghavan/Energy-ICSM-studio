
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/app/energy/2026/student/dashboard/layout';
import { bulkAddTeamMembers, bulkDeleteTeamMembers, updateTeamName, deleteTeam, deleteTeamMember, getStudentTeamDetails, type StudentTeamMember, type FullTeamDetails, type TeamMemberRole, type CricketSportRole, type BattingStyle, type BowlingStyle } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Trash2, Edit, Save, Upload, X, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { MemberFormDialog } from './MemberFormDialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const roles: TeamMemberRole[] = ['Player', 'Vice-Captain', 'Captain'];
const cricketRoles: CricketSportRole[] = ['Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper'];
const battingStyles: BattingStyle[] = ['Right Hand', 'Left Hand'];
const bowlingStyles: BowlingStyle[] = ['Right Arm Fast', 'Right Arm Medium', 'Right Arm Spin', 'Left Arm Fast', 'Left Arm Medium', 'Left Arm Spin', 'N/A'];
const sportsWithPositions = ['Football', 'Basketball', 'Volleyball', 'Kabaddi'];


function BulkAddDialog({ teamId, sportName, onSuccess }: { teamId: string, sportName: string, onSuccess: () => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [members, setMembers] = useState<any[]>([]);
    
    // Form state for a new member
    const [currentName, setCurrentName] = useState('');
    const [currentRole, setCurrentRole] = useState<TeamMemberRole>('Player');
    const [currentPosition, setCurrentPosition] = useState('');
    const [currentSportRole, setCurrentSportRole] = useState<CricketSportRole | ''>('');
    const [currentBattingStyle, setCurrentBattingStyle] = useState<BattingStyle | ''>('');
    const [currentBowlingStyle, setCurrentBowlingStyle] = useState<BowlingStyle | ''>('');
    const [isWicketKeeper, setIsWicketKeeper] = useState(false);

    const isCricket = sportName === 'Cricket';
    const showPositionField = sportsWithPositions.includes(sportName);

    const resetForm = () => {
        setCurrentName('');
        setCurrentRole('Player');
        setCurrentPosition('');
        setCurrentSportRole('');
        setCurrentBattingStyle('');
        setCurrentBowlingStyle('');
        setIsWicketKeeper(false);
    };

    const handleAddToList = () => {
        if (!currentName.trim()) {
            toast({ variant: 'destructive', title: 'Name is required' });
            return;
        }
        
        const newMember: any = { name: currentName, role: currentRole };
        if (showPositionField && currentPosition) {
            newMember.additional_details = { position: currentPosition };
        }
        if (isCricket) {
            if (currentSportRole) newMember.sport_role = currentSportRole;
            if (currentBattingStyle) newMember.batting_style = currentBattingStyle;
            if (currentBowlingStyle) newMember.bowling_style = currentBowlingStyle;
            if (isWicketKeeper) newMember.is_wicket_keeper = isWicketKeeper;
        }

        setMembers(prev => [...prev, newMember]);
        resetForm();
    };

    const handleRemoveFromList = (index: number) => {
        setMembers(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (members.length === 0) {
            toast({ variant: 'destructive', title: 'No members to add' });
            return;
        }
        setIsSubmitting(true);
        try {
            await bulkAddTeamMembers(teamId, members);
            toast({ title: "Bulk Add Successful", description: `${members.length} members have been added.` });
            setMembers([]);
            onSuccess();
            setIsOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Bulk Add Failed', description: error.response?.data?.message || 'An error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setMembers([]);
            resetForm();
            setIsSubmitting(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Add</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Bulk Add Members</DialogTitle>
                    <DialogDescription>Add multiple team members using the form below. They will all be added at once when you submit.</DialogDescription>
                </DialogHeader>
                
                <div className="grid md:grid-cols-2 gap-8 py-4">
                    {/* Form Side */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Add New Member</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="new-member-name">Member Name</Label>
                            <Input id="new-member-name" value={currentName} onChange={e => setCurrentName(e.target.value)} placeholder="Enter name"/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-member-role">Role</Label>
                            <Select value={currentRole} onValueChange={(value) => setCurrentRole(value as TeamMemberRole)}>
                                <SelectTrigger id="new-member-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        
                        {showPositionField && (
                            <div className="grid gap-2">
                                <Label htmlFor="new-member-position">Position</Label>
                                <Input id="new-member-position" value={currentPosition} onChange={e => setCurrentPosition(e.target.value)} placeholder="e.g. Defender, Setter"/>
                            </div>
                        )}

                        {isCricket && (
                             <div className="space-y-4 pt-2 border-t">
                                <h5 className="font-medium">Cricket Details</h5>
                                 <div className="grid gap-2">
                                    <Label>Playing Role</Label>
                                    <Select value={currentSportRole} onValueChange={v => setCurrentSportRole(v as CricketSportRole)}><SelectTrigger><SelectValue placeholder="Select playing role" /></SelectTrigger><SelectContent>{cricketRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Batting Style</Label>
                                        <Select value={currentBattingStyle} onValueChange={v => setCurrentBattingStyle(v as BattingStyle)}><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger><SelectContent>{battingStyles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Bowling Style</Label>
                                        <Select value={currentBowlingStyle} onValueChange={v => setCurrentBowlingStyle(v as BowlingStyle)}><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger><SelectContent>{bowlingStyles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2"><Checkbox id="isWK" checked={isWicketKeeper} onCheckedChange={c => setIsWicketKeeper(!!c)} /><Label htmlFor="isWK">Is Wicket Keeper?</Label></div>
                            </div>
                        )}

                        <Button type="button" onClick={handleAddToList} className="w-full">Add to List</Button>
                    </div>

                    {/* List Side */}
                    <div className="space-y-2">
                        <Label>Members to Add ({members.length})</Label>
                        <div className="border rounded-md max-h-[400px] overflow-y-auto p-2 space-y-2">
                            {members.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No members added yet.</p>}
                            {members.map((member, index) => (
                                <div key={index} className="flex items-start justify-between p-2 bg-muted/50 rounded-md">
                                    <div>
                                        <p className="font-medium">{member.name} <span className="text-xs text-muted-foreground">({member.role})</span></p>
                                        {(member.additional_details?.position || member.sport_role) && (
                                            <p className="text-xs text-primary font-semibold">
                                                {member.additional_details?.position || member.sport_role}
                                                {member.is_wicket_keeper && ", WK"}
                                            </p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleRemoveFromList(index)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting || members.length === 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Add {members.length > 0 ? members.length : ''} Members
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ManageTeamClientPage({ teamId }: { teamId: string }) {
    const { refetch: refetchDashboard } = useDashboard();
    const [team, setTeam] = useState<FullTeamDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<StudentTeamMember | null>(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

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
        refetchDashboard();
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
            refetchDashboard();
            router.push('/energy/2026/student/dashboard');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete team.' });
        }
    };
    
    const handleDeleteMember = async (memberId: string) => {
        try {
            await deleteTeamMember(memberId);
            toast({ title: 'Success', description: 'Team member removed.' });
            handleSuccess();
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
            handleSuccess();
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        );
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

    if (!team.Sport || !team.members) {
        return (
             <div className="container py-8 text-center">
                <p className="text-destructive">Incomplete team data received. Cannot display page.</p>
                <Button variant="outline" onClick={() => router.push('/energy/2026/student/dashboard')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                </Button>
            </div>
        );
    }
    
    const memberCount = team.members.length;
    const maxPlayers = team.Sport.max_players;
    const progressValue = (memberCount / maxPlayers) * 100;
    const allMembersSelected = selectedMemberIds.length === team.members.length && team.members.length > 0;

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
                                 <BulkAddDialog teamId={team.id} sportName={team.Sport.name} onSuccess={handleSuccess} />
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
                                            onCheckedChange={(checked) => setSelectedMemberIds(checked ? team.members.map(m => m.id) : [])}
                                            aria-label="Select all rows"
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.members.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No members added yet.</TableCell></TableRow>
                                ) : team.members.map(member => (
                                    <TableRow key={member.id} data-state={selectedMemberIds.includes(member.id) && "selected"}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedMemberIds.includes(member.id)}
                                                onCheckedChange={(checked) => handleSelectMember(member.id, !!checked)}
                                                aria-label={`Select row for ${member.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{member.name}</TableCell>
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
                onSuccess={handleSuccess}
            />
        </div>
    );
}
