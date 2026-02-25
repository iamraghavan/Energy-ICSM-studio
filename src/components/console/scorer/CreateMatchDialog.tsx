
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSports, getTeamsBySport, createMatch, type ApiSport, type ApiTeam } from '@/lib/api';
import { Loader2, PlusCircle } from 'lucide-react';

const matchFormSchema = z.object({
    sport_id: z.string().min(1, 'Please select a sport.'),
    team_a_id: z.string().min(1, 'Please select Team A.'),
    team_b_id: z.string().min(1, 'Please select Team B.'),
    start_time: z.string().min(1, 'Please select a date and time.'),
    venue: z.string().min(3, 'Venue must be at least 3 characters.'),
    referee_name: z.string().optional(),
}).refine(data => data.team_a_id !== data.team_b_id, {
    message: "Team A and Team B cannot be the same.",
    path: ["team_b_id"],
});

export function CreateMatchDialog({ onMatchCreated }: { onMatchCreated: () => void }) {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sports, setSports] = useState<ApiSport[]>([]);
    const [teams, setTeams] = useState<ApiTeam[]>([]);
    const [isLoadingSports, setIsLoadingSports] = useState(false);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    
    const form = useForm<z.infer<typeof matchFormSchema>>({
        resolver: zodResolver(matchFormSchema),
        defaultValues: {
            sport_id: '',
            team_a_id: '',
            team_b_id: '',
            start_time: '',
            venue: 'Main Ground',
            referee_name: '',
        },
    });

    const selectedSportId = form.watch('sport_id');

    useEffect(() => {
        if (isModalOpen) {
            setIsLoadingSports(true);
            getSports()
                .then(setSports)
                .catch(() => {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not load sports.' });
                })
                .finally(() => setIsLoadingSports(false));
            
            setTeams([]);
            form.reset({
                sport_id: '',
                team_a_id: '',
                team_b_id: '',
                start_time: '',
                venue: 'Main Ground',
                referee_name: '',
            });
        }
    }, [isModalOpen, toast, form]);

    useEffect(() => {
        if (selectedSportId) {
            setIsLoadingTeams(true);
            form.setValue('team_a_id', '');
            form.setValue('team_b_id', '');
            getTeamsBySport(selectedSportId)
                .then(setTeams)
                .catch(() => {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not load teams for the selected sport.' });
                    setTeams([]);
                })
                .finally(() => setIsLoadingTeams(false));
        } else {
            setTeams([]);
        }
    }, [selectedSportId, form, toast]);

    const onSubmit = async (values: z.infer<typeof matchFormSchema>) => {
        try {
            await createMatch({
                ...values,
                sport_id: parseInt(values.sport_id, 10),
            });
            toast({ title: 'Match Scheduled', description: `A new match has been created.` });
            onMatchCreated();
            setIsModalOpen(false);
            form.reset();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.error || 'Failed to schedule match.' });
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4"/>Schedule Match</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule New Match</DialogTitle>
                    <DialogDescription>Select two teams and provide match details.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                         <FormField control={form.control} name="sport_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sport</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger disabled={isLoadingSports}>
                                            <SelectValue placeholder="Select a sport" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>{sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                         )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="team_a_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team A</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSportId || isLoadingTeams}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingTeams ? "Loading..." : "Select Team A"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="team_b_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team B</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSportId || isLoadingTeams}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingTeams ? "Loading..." : "Select Team B"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                             )} />
                        </div>
                        <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g. Main Ground" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="referee_name" render={({ field }) => (<FormItem><FormLabel>Referee Name (Optional)</FormLabel><FormControl><Input placeholder="Enter referee name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="start_time" render={({ field }) => (<FormItem><FormLabel>Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Schedule
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
