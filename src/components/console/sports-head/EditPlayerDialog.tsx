'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronDown } from 'lucide-react';
import { updateSportsHeadTeamMember, type StudentTeamMember, type ApiSport } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
    role: z.enum(['Captain', 'Vice-Captain', 'Player']),
    sport_role: z.string().optional(),
    batting_style: z.string().optional(),
    bowling_style: z.string().optional(),
    is_wicket_keeper: z.boolean().optional(),
    additional_details: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const cricketSportRoles = ['Batsman', 'Bowler', 'All-rounder'];
const battingStyles = ['Right Hand', 'Left Hand'];
const bowlingStyles = ['Right Arm Fast', 'Right Arm Medium', 'Right Arm Spin', 'Left Arm Fast', 'Left Arm Medium', 'Left Arm Spin', 'N/A'];
const footballPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
const basketballPositions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];


interface EditPlayerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    player: StudentTeamMember;
    sport: ApiSport;
    onSuccess: () => void;
}

export function EditPlayerDialog({ isOpen, onClose, teamId, player, sport, onSuccess }: EditPlayerDialogProps) {
    const { toast } = useToast();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (player) {
            form.reset({
                role: player.role,
                sport_role: player.sport_role || '',
                batting_style: player.batting_style || '',
                bowling_style: player.bowling_style || '',
                is_wicket_keeper: player.is_wicket_keeper || false,
                additional_details: (player.additional_details as string) || '',
            });
        }
    }, [player, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            await updateSportsHeadTeamMember(teamId, player.student_id, values);
            toast({ title: 'Player Updated', description: `${player.Student?.name}'s details have been updated.` });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.response?.data?.message || 'Could not update player details.',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Player: {player.Student?.name}</DialogTitle>
                    <DialogDescription>Update the player's role and sport-specific details.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="role" render={({ field }) => (
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

                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground">
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    {sport.name} Specific Details (Optional)
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 px-1 space-y-4">
                                {sport.name === 'Cricket' && (
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="sport_role" render={({ field }) => (
                                                <FormItem><FormLabel>Playing Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl><SelectContent>{cricketSportRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="batting_style" render={({ field }) => (
                                                <FormItem><FormLabel>Batting Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger></FormControl><SelectContent>{battingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                        <FormField control={form.control} name="bowling_style" render={({ field }) => (
                                            <FormItem><FormLabel>Bowling Style</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger></FormControl><SelectContent>{bowlingStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="is_wicket_keeper" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border bg-background p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Wicket Keeper</FormLabel></div></FormItem>
                                        )}/>
                                    </div>
                                )}

                                {sport.name === 'Football' && (
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                                        <FormField control={form.control} name="sport_role" render={({ field }) => (
                                            <FormItem><FormLabel>Playing Position</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select playing position" /></SelectTrigger></FormControl><SelectContent>{footballPositions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                )}

                                {sport.name === 'Basketball' && (
                                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                                        <FormField control={form.control} name="sport_role" render={({ field }) => (
                                            <FormItem><FormLabel>Position</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger></FormControl><SelectContent>{basketballPositions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                        
                        <FormField control={form.control} name={`additional_details`} render={({ field }) => (
                            <FormItem className="pt-2"><FormLabel>Additional Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Any other info about the player..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
