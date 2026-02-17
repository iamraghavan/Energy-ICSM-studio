
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSportsHeadStudents, bulkAddPlayersToTeam, type SportStudent } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface AddPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    onSuccess: () => void;
    maxPlayers: number;
    currentCount: number;
}

export function AddPlayerDialog({ isOpen, onClose, teamId, onSuccess, maxPlayers, currentCount }: AddPlayerDialogProps) {
    const { toast } = useToast();
    const [allStudents, setAllStudents] = useState<SportStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    const remainingSlots = maxPlayers - currentCount;
    const canAddMore = selectedStudentIds.length < remainingSlots;

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getSportsHeadStudents()
                .then(data => {
                    const unassigned = data.filter(s => !s.team_id);
                    setAllStudents(unassigned);
                })
                .catch(() => {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch list of available students.' });
                })
                .finally(() => setIsLoading(false));
        } else {
            // Reset state on close
            setSelectedStudentIds([]);
            setSearchTerm('');
        }
    }, [isOpen, toast]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return allStudents;
        return allStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.college.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allStudents]);

    const handleSelectStudent = (regId: string) => {
        const isSelected = selectedStudentIds.includes(regId);
        if (isSelected) {
            setSelectedStudentIds(prev => prev.filter(id => id !== regId));
        } else {
            if (canAddMore) {
                setSelectedStudentIds(prev => [...prev, regId]);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Team Full',
                    description: `You can only add ${remainingSlots} more players to this team.`,
                });
            }
        }
    };

    const handleAddPlayers = async () => {
        if (selectedStudentIds.length === 0) {
            toast({ variant: 'destructive', title: 'No players selected' });
            return;
        }
        setIsSubmitting(true);
        try {
            await bulkAddPlayersToTeam(teamId, selectedStudentIds);
            toast({ title: 'Success', description: `${selectedStudentIds.length} player(s) added to the team.` });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to add players', description: error.response?.data?.message || 'An error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Add Players to Team</DialogTitle>
                    <DialogDescription>Select students from the list of unassigned players for this sport.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Team Capacity</AlertTitle>
                        <AlertDescription>
                            You can add up to <strong>{remainingSlots}</strong> more players to this team. Selected: <strong>{selectedStudentIds.length}</strong>
                        </AlertDescription>
                    </Alert>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or college..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-72">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                            {isLoading ? (
                                [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <div 
                                        key={student.registration_id} 
                                        onClick={() => handleSelectStudent(student.registration_id)}
                                        className={cn(
                                            "cursor-pointer transition-all border rounded-lg p-4 flex flex-col items-start gap-4 hover:bg-muted/50 relative",
                                            selectedStudentIds.includes(student.registration_id) && "border-primary ring-2 ring-primary bg-primary/5",
                                            !canAddMore && !selectedStudentIds.includes(student.registration_id) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2">
                                            <Checkbox 
                                                checked={selectedStudentIds.includes(student.registration_id)} 
                                                onCheckedChange={() => handleSelectStudent(student.registration_id)}
                                                disabled={!canAddMore && !selectedStudentIds.includes(student.registration_id)}
                                            />
                                        </div>
                                         <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('').substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">{student.college}</p>
                                            </div>
                                        </div>
                                        {student.mobile && <Badge variant="outline" className="font-mono">{student.mobile}</Badge>}
                                    </div>
                                ))
                            ) : (
                                <div className="md:col-span-2 text-center py-16 text-muted-foreground border rounded-lg">
                                    <p>No unassigned players found.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleAddPlayers} disabled={isSubmitting || selectedStudentIds.length === 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} Player(s)` : 'Player(s)'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
