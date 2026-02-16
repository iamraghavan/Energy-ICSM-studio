
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { bulkAddTeamMembers, type ApiSport } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';


const memberSchema = z.object({
  name: z.string().min(3, "Name is required."),
  email: z.string().email("Invalid email.").optional().or(z.literal('')),
  mobile: z.string().length(10, "Must be 10 digits.").optional().or(z.literal('')),
  role: z.enum(['Captain', 'Vice-Captain', 'Player']).default('Player'),
  sport_role: z.string().optional(),
  batting_style: z.string().optional(),
  bowling_style: z.string().optional(),
  is_wicket_keeper: z.boolean().optional().default(false),
  additional_details: z.string().optional(),
});

const formSchema = z.object({
  members: z.array(memberSchema).min(1, "You must add at least one member."),
});

type FormValues = z.infer<typeof formSchema>;

const cricketSportRoles = ['Batsman', 'Bowler', 'All-rounder'];
const battingStyles = ['Right Hand', 'Left Hand'];
const bowlingStyles = ['Right Arm Fast', 'Right Arm Medium', 'Right Arm Spin', 'Left Arm Fast', 'Left Arm Medium', 'Left Arm Spin', 'N/A'];
const footballPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
const basketballPositions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];


const defaultMemberValues = {
    name: '',
    email: '',
    mobile: '',
    role: 'Player' as const,
    sport_role: '',
    batting_style: '',
    bowling_style: '',
    is_wicket_keeper: false,
    additional_details: '',
};

interface AddMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    sport: ApiSport;
    onSuccess: () => void;
}

export function AddMemberDialog({ isOpen, onClose, teamId, sport, onSuccess }: AddMemberDialogProps) {
    const { toast } = useToast();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            members: [defaultMemberValues]
        },
    });

    const { control, handleSubmit, formState: { isSubmitting } } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "members"
    });

    const onSubmit = async (data: FormValues) => {
        try {
            await bulkAddTeamMembers(teamId, data.members);
            toast({ title: 'Success', description: `${data.members.length} member(s) added.` });
            onSuccess();
            onClose();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Failed to add members', description: error.response?.data?.message || 'An error occurred.' });
        }
    };
    
     useEffect(() => {
        if (!isOpen) {
            form.reset({ members: [defaultMemberValues] });
        }
    }, [isOpen, form]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Bulk Add Members to {sport.name} Team</DialogTitle>
                    <DialogDescription>Add player details below. At least a name is required for each player.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ScrollArea className="h-[60vh] my-4">
                            <div className="space-y-6 pr-4">
                                {fields.map((field, index) => (
                                    <Card key={field.id} className="bg-muted/50">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>Player {index + 1}</CardTitle>
                                                {index > 0 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                        <span className="sr-only">Remove Player</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                 <FormField control={control} name={`members.${index}.name`} render={({ field }) => (
                                                    <FormItem><FormLabel>Player Name</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={control} name={`members.${index}.role`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Team Role</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Player">Player</SelectItem>
                                                                <SelectItem value="Vice-Captain">Vice-Captain</SelectItem>
                                                                <SelectItem value="Captain">Captain</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                 <FormField control={control} name={`members.${index}.email`} render={({ field }) => (
                                                    <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="player@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                 <FormField control={control} name={`members.${index}.mobile`} render={({ field }) => (
                                                    <FormItem><FormLabel>Mobile (Optional)</FormLabel><FormControl><Input type="tel" maxLength={10} placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                            
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground">
                                                        <ChevronDown className="h-4 w-4 mr-2" />
                                                        {sport.name} Specific Details (Optional)
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="pt-4 px-1 space-y-4">
                                                    {sport.name === 'Cricket' && (
                                                        <>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                <FormField control={control} name={`members.${index}.sport_role`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Playing Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl><SelectContent>{cricketSportRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                                )}/>
                                                                <FormField control={control} name={`members.${index}.batting_style`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Batting Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger></FormControl><SelectContent>{battingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                                )}/>
                                                                <FormField control={control} name={`members.${index}.bowling_style`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Bowling Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger></FormControl><SelectContent>{bowlingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                                )}/>
                                                            </div>
                                                            <FormField control={control} name={`members.${index}.is_wicket_keeper`} render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Is Wicket Keeper?</FormLabel></div></FormItem>
                                                            )}/>
                                                        </>
                                                    )}

                                                    {sport.name === 'Football' && (
                                                        <FormField control={control} name={`members.${index}.sport_role`} render={({ field }) => (
                                                            <FormItem><FormLabel>Playing Position</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select playing position" /></SelectTrigger></FormControl><SelectContent>{footballPositions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                        )}/>
                                                    )}

                                                    {sport.name === 'Basketball' && (
                                                        <FormField control={control} name={`members.${index}.sport_role`} render={({ field }) => (
                                                            <FormItem><FormLabel>Position</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger></FormControl><SelectContent>{basketballPositions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                        )}/>
                                                    )}
                                                </CollapsibleContent>
                                            </Collapsible>

                                            <FormField control={control} name={`members.${index}.additional_details`} render={({ field }) => (
                                                <FormItem><FormLabel>Additional Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Any other info..." {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={() => append(defaultMemberValues)} className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Player
                                </Button>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-6">
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add {fields.length} Member(s)
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
