'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addTeamMember, updateTeamMember, type StudentTeamMember, type CricketSportRole, type BattingStyle, type BowlingStyle, type TeamMemberRole } from '@/lib/api';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const memberFormSchema = z.object({
  name: z.string().min(3, "Name is required."),
  email: z.string().email("A valid email is required."),
  mobile: z.string().length(10, "Must be a 10-digit mobile number."),
  role: z.enum(['Captain', 'Vice-Captain', 'Player']),
  sport_role: z.string().optional(),
  batting_style: z.string().optional(),
  bowling_style: z.string().optional(),
  is_wicket_keeper: z.boolean().default(false),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const roles: TeamMemberRole[] = ['Player', 'Vice-Captain', 'Captain'];
const cricketRoles: CricketSportRole[] = ['Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper'];
const battingStyles: BattingStyle[] = ['Right Hand', 'Left Hand'];
const bowlingStyles: BowlingStyle[] = ['Right Arm Fast', 'Right Arm Medium', 'Right Arm Spin', 'Left Arm Fast', 'Left Arm Medium', 'Left Arm Spin', 'N/A'];

interface MemberFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    sportName: string;
    existingMember: StudentTeamMember | null;
    onSuccess: () => void;
}

export function MemberFormDialog({ isOpen, onClose, teamId, sportName, existingMember, onSuccess }: MemberFormDialogProps) {
    const { toast } = useToast();
    const isCricket = sportName === 'Cricket';

    const form = useForm<MemberFormValues>({
        resolver: zodResolver(memberFormSchema),
        defaultValues: {
            name: '',
            email: '',
            mobile: '',
            role: 'Player',
            is_wicket_keeper: false,
        }
    });
    
    useEffect(() => {
        if (isOpen) {
            if (existingMember) {
                form.reset({
                    ...existingMember,
                    sport_role: existingMember.sport_role || undefined,
                    batting_style: existingMember.batting_style || undefined,
                    bowling_style: existingMember.bowling_style || undefined,
                });
            } else {
                form.reset({
                    name: '', email: '', mobile: '', role: 'Player', is_wicket_keeper: false,
                    sport_role: undefined, batting_style: undefined, bowling_style: undefined,
                });
            }
        }
    }, [existingMember, isOpen, form]);

    const onSubmit = async (values: MemberFormValues) => {
        try {
            if (existingMember) {
                await updateTeamMember(existingMember.id, values);
                toast({ title: 'Success', description: 'Member details updated.' });
            } else {
                await addTeamMember(teamId, values as Omit<StudentTeamMember, 'id'>);
                toast({ title: 'Success', description: 'New member added to the team.' });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Operation Failed', description: error.response?.data?.message || 'An error occurred.' });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
                    <DialogDescription>Fill in the details for the team member.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Member's full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="member@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="mobile" render={({ field }) => (<FormItem><FormLabel>Mobile</FormLabel><FormControl><Input type="tel" placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Team Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        
                        {isCricket && (
                             <>
                                <h4 className="text-sm font-medium pt-2 border-t">Cricket Details</h4>
                                <FormField control={form.control} name="sport_role" render={({ field }) => (<FormItem><FormLabel>Playing Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select playing role" /></SelectTrigger></FormControl><SelectContent>{cricketRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField control={form.control} name="batting_style" render={({ field }) => (<FormItem><FormLabel>Batting Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select batting style" /></SelectTrigger></FormControl><SelectContent>{battingStyles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="bowling_style" render={({ field }) => (<FormItem><FormLabel>Bowling Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select bowling style" /></SelectTrigger></FormControl><SelectContent>{bowlingStyles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="is_wicket_keeper" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Is Wicket Keeper?</FormLabel></div></FormItem>)} />
                             </>
                        )}
                        
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {existingMember ? 'Save Changes' : 'Add Member'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
