
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sportsHeadBulkAddPlayers, getSportsHeadStudents, type FullSportsHeadTeam, type SportStudent } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, ChevronDown } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '../ui/skeleton';

const playerSchema = z.object({
  type: z.enum(['manual', 'existing']).default('manual'),
  
  // Manual fields
  name: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email.").optional().or(z.literal('')),
  
  // Existing field
  student_id: z.string().optional(), // This will hold the registration_id

  // Common fields
  role: z.enum(['Captain', 'Vice-Captain', 'Player']).default('Player'),
  sport_role: z.string().optional(),
  batting_style: z.string().optional(),
  bowling_style: z.string().optional(),
  is_wicket_keeper: z.boolean().optional().default(false),
  additional_details: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'manual') {
    if (!data.name || data.name.length < 3) {
      ctx.addIssue({ code: 'custom', message: 'Name is required.', path: ['name'] });
    }
    if (!data.mobile || data.mobile.length !== 10) {
      ctx.addIssue({ code: 'custom', message: 'A 10-digit mobile number is required.', path: ['mobile'] });
    }
  } else { // 'existing'
    if (!data.student_id) {
      ctx.addIssue({ code: 'custom', message: 'Please select a student.', path: ['student_id'] });
    }
  }
});


const formSchema = z.object({
  players: z.array(playerSchema).min(1, "You must add at least one player."),
});

type FormValues = z.infer<typeof formSchema>;

const cricketSportRoles = ['Batsman', 'Bowler', 'All-rounder'];
const battingStyles = ['Right Hand', 'Left Hand'];
const bowlingStyles = ['Right Arm Fast', 'Right Arm Medium', 'Right Arm Spin', 'Left Arm Fast', 'Left Arm Medium', 'Left Arm Spin', 'N/A'];
const footballPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
const basketballPositions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];

const defaultPlayerValues: z.infer<typeof playerSchema> = {
    type: 'manual',
    name: '',
    mobile: '',
    email: '',
    role: 'Player' as const,
    sport_role: '',
    batting_style: '',
    bowling_style: '',
    is_wicket_keeper: false,
    additional_details: '',
};

interface BulkAddPlayersDialogProps {
    team: FullSportsHeadTeam;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BulkAddPlayersDialog({ team, isOpen, onClose, onSuccess }: BulkAddPlayersDialogProps) {
    const { toast } = useToast();
    const [unassignedStudents, setUnassignedStudents] = useState<SportStudent[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            players: [defaultPlayerValues]
        },
    });

    const { control, handleSubmit, formState: { isSubmitting }, watch } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "players"
    });

    useEffect(() => {
        if (isOpen) {
            setIsLoadingStudents(true);
            getSportsHeadStudents()
                .then(data => {
                    const teamMemberStudentIds = new Set(team.members.map(m => m.student_id));
                    const unassigned = data.filter(s => !teamMemberStudentIds.has(s.student_id));
                    setUnassignedStudents(unassigned);
                })
                .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch list of available students.' }))
                .finally(() => setIsLoadingStudents(false));
        }
    }, [isOpen, toast, team.members]);

    const onSubmit = async (data: FormValues) => {
        const payload = {
            players: data.players.map(p => {
                if (p.type === 'existing') {
                    // Send only the student_id (which is the registration_id)
                    return { student_id: p.student_id };
                }
                
                // For manual entries, build the detailed object
                const manualPlayer: any = { name: p.name, mobile: p.mobile, role: p.role };
                if (p.email) manualPlayer.email = p.email;
                if (p.sport_role) manualPlayer.sport_role = p.sport_role;
                if (p.batting_style) manualPlayer.batting_style = p.batting_style;
                if (p.bowling_style) manualPlayer.bowling_style = p.bowling_style;
                if (p.is_wicket_keeper) manualPlayer.is_wicket_keeper = p.is_wicket_keeper;
                if (p.additional_details) manualPlayer.additional_details = p.additional_details;
                return manualPlayer;
            })
        };

        try {
            const result = await sportsHeadBulkAddPlayers(team.id, payload.players);
            const { added, updated, errors } = result.stats || { added: 0, updated: 0, errors: [] };
            toast({ 
                title: 'Import Complete', 
                description: `${added} players added, ${updated} updated. ${errors.length > 0 ? `${errors.length} errors.` : ''}` 
            });
            if (errors.length > 0) {
                console.error("Import errors:", errors);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Failed to add players', description: error.response?.data?.error || 'An error occurred.' });
        }
    };
    
     useEffect(() => {
        if (!isOpen) {
            form.reset({ players: [defaultPlayerValues] });
        }
    }, [isOpen, form]);
    
    const selectedStudentIds = watch('players').filter(p => p.type === 'existing' && p.student_id).map(p => p.student_id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Bulk Add Players to {team.team_name}</DialogTitle>
                    <DialogDescription>Manually enter new player details or select from existing registered students.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ScrollArea className="h-[60vh] my-4">
                            <div className="space-y-6 pr-4">
                                {fields.map((field, index) => {
                                    const currentType = watch(`players.${index}.type`);
                                    return (
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
                                             <FormField control={control} name={`players.${index}.type`} render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormControl>
                                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="manual" /></FormControl><FormLabel className="font-normal">Add New Player</FormLabel></FormItem>
                                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="existing" /></FormControl><FormLabel className="font-normal">Select Existing Player</FormLabel></FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                </FormItem>
                                            )} />

                                            {currentType === 'manual' ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <FormField control={control} name={`players.${index}.name`} render={({ field }) => (
                                                            <FormItem><FormLabel>Player Name</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />
                                                        <FormField control={control} name={`players.${index}.mobile`} render={({ field }) => (
                                                            <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input type="tel" maxLength={10} placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <FormField control={control} name={`players.${index}.email`} render={({ field }) => (
                                                            <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="player@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />
                                                        <FormField control={control} name={`players.${index}.role`} render={({ field }) => (
                                                            <FormItem><FormLabel>Team Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Player">Player</SelectItem><SelectItem value="Vice-Captain">Vice-Captain</SelectItem><SelectItem value="Captain">Captain</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                                        )} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <FormField control={control} name={`players.${index}.student_id`} render={({ field }) => (
                                                     <FormItem><FormLabel>Select Registered Student</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger>{isLoadingStudents ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading students...</div> : <SelectValue placeholder="Choose an unassigned player" />}</SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {unassignedStudents.filter(s => !selectedStudentIds.includes(s.registration_id) || s.registration_id === field.value)
                                                                    .map(s => <SelectItem key={s.registration_id} value={s.registration_id}>{s.name} ({s.college})</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            )}
                                            
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <Button type="button" variant="outline" size="sm" className="w-full justify-start text-muted-foreground">
                                                        <ChevronDown className="h-4 w-4 mr-2" />
                                                        {team.Sport.name} Specific Details (Optional)
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="pt-4 px-1 space-y-4">
                                                    {team.Sport.name === 'Cricket' && (
                                                        <div className="space-y-4 p-4 border rounded-lg bg-background">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <FormField control={control} name={`players.${index}.sport_role`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Playing Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl><SelectContent>{cricketSportRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                                )}/>
                                                                <FormField control={control} name={`players.${index}.batting_style`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Batting Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger></FormControl><SelectContent>{battingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                                )}/>
                                                            </div>
                                                            <FormField control={control} name={`players.${index}.bowling_style`} render={({ field }) => (
                                                                <FormItem><FormLabel>Bowling Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger></FormControl><SelectContent>{bowlingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                            )}/>
                                                            <FormField control={control} name={`players.${index}.is_wicket_keeper`} render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border bg-background p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Wicket Keeper</FormLabel></div></FormItem>
                                                            )}/>
                                                        </div>
                                                    )}

                                                    {team.Sport.name === 'Football' && (
                                                        <div className="p-4 border rounded-lg bg-background">
                                                            <FormField control={control} name={`players.${index}.sport_role`} render={({ field }) => (
                                                                <FormItem><FormLabel>Playing Position</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select playing position" /></SelectTrigger></FormControl><SelectContent>{footballPositions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                            )}/>
                                                        </div>
                                                    )}

                                                    {team.Sport.name === 'Basketball' && (
                                                         <div className="p-4 border rounded-lg bg-background">
                                                            <FormField control={control} name={`players.${index}.sport_role`} render={({ field }) => (
                                                                <FormItem><FormLabel>Position</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger></FormControl><SelectContent>{basketballPositions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                                            )}/>
                                                        </div>
                                                    )}
                                                </CollapsibleContent>
                                            </Collapsible>

                                            <FormField control={control} name={`players.${index}.additional_details`} render={({ field }) => (
                                                <FormItem><FormLabel>Additional Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Any other info..." {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </CardContent>
                                    </Card>
                                    )
                                })}
                                <Button type="button" variant="outline" onClick={() => append(defaultPlayerValues)} className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Player
                                </Button>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-6">
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add {fields.length} Player(s)
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
