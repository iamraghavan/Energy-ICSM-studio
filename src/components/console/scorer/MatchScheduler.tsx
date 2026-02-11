'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMatchesBySport, createMatch, getTeamsBySport, type ApiMatch, type ApiTeam } from "@/lib/api";
import { MatchCard } from "./MatchCard";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, CalendarCog } from 'lucide-react';
import { io } from 'socket.io-client';

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

export function MatchScheduler({ sportId }: { sportId?: string }) {
    const [upcomingMatches, setUpcomingMatches] = useState<ApiMatch[]>([]);
    const [teams, setTeams] = useState<ApiTeam[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const fetchUpcoming = async () => {
        if (!sportId) return;
        setIsLoading(true);
        try {
            const [matchesData, teamsData] = await Promise.all([
                getMatchesBySport(sportId, 'scheduled'),
                getTeamsBySport(sportId)
            ]);
            setUpcomingMatches(matchesData);
            setTeams(teamsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch match data for this sport.' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUpcoming();

        const socket = io(SOCKET_URL);
        socket.on('connect', () => socket.emit('join_room', 'live_overview'));
        socket.on('overview_update', (data: any) => {
            toast({ title: 'Schedule Updated!', description: 'The match list has been updated in real-time.' });
            fetchUpcoming();
        });

        return () => {
            socket.disconnect();
        }
    }, [sportId, toast]);

    const onMatchCreated = () => {
        setIsModalOpen(false);
        fetchUpcoming();
    }

    const renderContent = () => {
        if (!sportId) {
             return (
                <div className="text-center py-16 text-muted-foreground">
                    <CalendarCog className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a sport to schedule matches.</p>
                </div>
            )
        }
        if (isLoading) {
            return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        }
        if (upcomingMatches.length > 0) {
            return upcomingMatches.map(match => (
               <MatchCard key={match.id} match={match} />
            ))
        }
        return <p className="text-muted-foreground text-center py-8">No upcoming matches scheduled for this sport.</p>
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
                            <Button disabled={!sportId || isLoading}><PlusCircle className="mr-2 h-4 w-4"/>Create Match</Button>
                        </DialogTrigger>
                        <CreateMatchDialog onMatchCreated={onMatchCreated} sportId={sportId} teams={teams} />
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderContent()}
            </CardContent>
        </Card>
    );
}


function CreateMatchDialog({ onMatchCreated, sportId, teams }: { onMatchCreated: () => void, sportId?: string, teams: ApiTeam[] }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof matchFormSchema>>({
        resolver: zodResolver(matchFormSchema),
        defaultValues: {
            referee_name: '',
            sport_id: sportId || '',
            start_time: '',
            team_a_id: '',
            team_b_id: '',
            venue: ''
        }
    });
    
    useEffect(() => {
        form.reset({
             referee_name: '',
            sport_id: sportId || '',
            start_time: '',
            team_a_id: '',
            team_b_id: '',
            venue: ''
        })
    }, [sportId, form])


    const onSubmit = async (values: z.infer<typeof matchFormSchema>) => {
        if (!sportId) {
            toast({ variant: 'destructive', title: 'Error', description: 'No sport selected.' });
            return;
        }
        try {
            await createMatch({
                ...values,
                sport_id: parseInt(sportId, 10),
            });
            toast({ title: 'Success', description: 'Match created successfully.' });
            onMatchCreated();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to create match.' });
        }
    }

    if (teams.length < 2) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cannot Create Match</DialogTitle>
                    <DialogDescription>
                        There must be at least two teams registered for this sport to create a match.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogFooter>
                </DialogContent>
        )
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
                <DialogDescription>Fill in the details to schedule a new match.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
