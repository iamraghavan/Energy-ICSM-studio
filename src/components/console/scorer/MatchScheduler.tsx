'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMatches, createMatch, getSports, getTeamsBySport, type ApiMatch, type ApiSport, type ApiTeam } from "@/lib/api";
import { MatchCard } from "./MatchCard";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = 'https://energy-sports-meet-backend.onrender.com';

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

export function MatchScheduler() {
    const [upcomingMatches, setUpcomingMatches] = useState<ApiMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const fetchUpcoming = async () => {
        setIsLoading(true);
        try {
            const data = await getMatches('scheduled');
            setUpcomingMatches(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch upcoming matches.' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUpcoming();
        
        const newSocket = io(SOCKET_URL);
        newSocket.on('connect', () => {
            newSocket.emit('join_room', 'live_overview');
        });
        
        newSocket.on('overview_update', (data: { action: 'create' | 'update' | 'delete', match?: ApiMatch, matchId?: string }) => {
            toast({ title: "Schedule Updated!", description: "The list of matches has been updated." });
            fetchUpcoming();
        });

        return () => {
            newSocket.disconnect();
        }
    }, [toast]);

    const onMatchCreated = () => {
        setIsModalOpen(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Match Scheduler</CardTitle>
                        <CardDescription>A list of scheduled matches yet to begin.</CardDescription>
                    </div>
                     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4"/>Create Match</Button>
                        </DialogTrigger>
                        <CreateMatchDialog onMatchCreated={onMatchCreated} />
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                {!isLoading && upcomingMatches.length > 0 ? (
                    upcomingMatches.map(match => (
                       <MatchCard key={match.id} match={match}>
                       </MatchCard>
                    ))
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-8">No upcoming matches scheduled.</p>
                )}
            </CardContent>
        </Card>
    );
}


function CreateMatchDialog({ onMatchCreated }: { onMatchCreated: () => void }) {
    const [sports, setSports] = useState<ApiSport[]>([]);
    const [teams, setTeams] = useState<ApiTeam[]>([]);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof matchFormSchema>>({
        resolver: zodResolver(matchFormSchema),
        defaultValues: {
            referee_name: '',
            sport_id: '',
            start_time: '',
            team_a_id: '',
            team_b_id: '',
            venue: ''
        }
    });

    const sportId = form.watch('sport_id');

    useEffect(() => {
        const fetchSportsData = async () => {
            try {
                const data = await getSports();
                setSports(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch sports.' });
            }
        };
        fetchSportsData();
    }, [toast]);
    
    useEffect(() => {
        if (sportId) {
            const fetchTeamsData = async () => {
                try {
                    const data = await getTeamsBySport(sportId);
                    setTeams(data);
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch teams for this sport.' });
                }
            };
            fetchTeamsData();
            form.setValue('team_a_id', '');
            form.setValue('team_b_id', '');
        }
    }, [sportId, toast, form]);


    const onSubmit = async (values: z.infer<typeof matchFormSchema>) => {
        try {
            await createMatch({
                ...values,
                sport_id: parseInt(values.sport_id),
                referee_name: values.referee_name || undefined
            });
            toast({ title: 'Success', description: 'Match created successfully.' });
            onMatchCreated();
            form.reset();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to create match.' });
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
                <DialogDescription>Fill in the details to schedule a new match.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField control={form.control} name="sport_id" render={({ field }) => (
                        <FormItem><FormLabel>Sport</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a sport" /></SelectTrigger></FormControl>
                                <SelectContent>{sports.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />

                    {sportId && (
                        <>
                             <FormField control={form.control} name="team_a_id" render={({ field }) => (
                                <FormItem><FormLabel>Team A</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Team A" /></SelectTrigger></FormControl>
                                        <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="team_b_id" render={({ field }) => (
                                <FormItem><FormLabel>Team B</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Team B" /></SelectTrigger></FormControl>
                                        <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                        </>
                    )}
                    <FormField control={form.control} name="venue" render={({ field }) => (
                        <FormItem><FormLabel>Venue</FormLabel><FormControl><Input placeholder="e.g. Main Football Ground" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="referee_name" render={({ field }) => (
                        <FormItem><FormLabel>Referee Name (Optional)</FormLabel><FormControl><Input placeholder="e.g. John Smith" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="start_time" render={({ field }) => (
                        <FormItem><FormLabel>Start Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Match
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    )
}