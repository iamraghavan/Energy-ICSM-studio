
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSportsHeadStudents, addPlayerToTeam, type SportStudent } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    onSuccess: () => void;
    currentMemberIds: string[];
}

export function AddPlayerDialog({ isOpen, onClose, teamId, onSuccess, currentMemberIds }: AddPlayerDialogProps) {
    const { toast } = useToast();
    const [allStudents, setAllStudents] = useState<SportStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getSportsHeadStudents()
                .then(data => {
                    const unassigned = data.filter(s => !s.team_id && !currentMemberIds.includes(s.registration_id));
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
    }, [isOpen, toast, currentMemberIds]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return allStudents;
        return allStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.college.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allStudents]);

    const handleSelectStudent = (regId: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(regId)
                ? prev.filter(id => id !== regId)
                : [...prev, regId]
        );
    };

    const handleAddPlayers = async () => {
        if (selectedStudentIds.length === 0) {
            toast({ variant: 'destructive', title: 'No players selected' });
            return;
        }
        setIsSubmitting(true);
        try {
            // The endpoint is /:teamId/players/:studentId, where studentId is actually the registrationId
            const promises = selectedStudentIds.map(regId => addPlayerToTeam(teamId, regId));
            await Promise.all(promises);
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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Players to Team</DialogTitle>
                    <DialogDescription>Select students from the list of unassigned players for this sport.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
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
                         <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>College</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <TableRow key={student.registration_id} onClick={() => handleSelectStudent(student.registration_id)} className="cursor-pointer">
                                                <TableCell className="p-2"><Checkbox checked={selectedStudentIds.includes(student.registration_id)} /></TableCell>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell>{student.college}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center">No unassigned players found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleAddPlayers} disabled={isSubmitting || selectedStudentIds.length === 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add {selectedStudentIds.length > 0 ? selectedStudentIds.length : ''} Player(s)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
