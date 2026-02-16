
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, CalendarCog } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { getSportsHeadMatches, scheduleMatch, updateMatch, getSportsHeadTeams, type ApiMatch, type SportsHeadTeam } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/console/scorer/MatchCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const matchFormSchema = z.object({
    team_a_id: z.string().min(1, 'Please select Team A.'),
    team_b_id: z.string().min(1, 'Please select Team B.'),
    start_time: z.string().min(1, 'Please select a date and time.'),
    venue: z.string().min(3, 'Venue must be at least 3 characters.'),
    referee_name: z.string().optional(),
}).refine(data => data.team_a_id !== data.team_b_id, {
    message: "Team A and Team B cannot be the same.",
    path: ["team_b_id"],
});

function ScheduleMatchDialog({ onMatchCreated, teams, sportId }: { onMatchCreated: () => void, teams: SportsHeadTeam[], sportId: string }) {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const form = useForm<z.infer<typeof matchFormSchema>>({
        resolver: zodResolver(matchFormSchema),
        defaultValues: { venue: 'Main Ground' },
    });

    const onSubmit = async (values: z.infer<typeof matchFormSchema>) => {
        try {
            await scheduleMatch({
                ...values,
                sport_id: parseInt(sportId, 10),
            });
            toast({ title: 'Match Scheduled', description: `A new match has been created.` });
            onMatchCreated();
            setIsModalOpen(false);
            form.reset();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to schedule match.' });
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button disabled={teams.length < 2}><PlusCircle className="mr-2 h-4 w-4"/>Schedule Match</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule New Match</DialogTitle>
                    <DialogDescription>Select two teams and provide match details.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="team_a_id" render={({ field }) => (<FormItem><FormLabel>Team A</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Team A" /></SelectTrigger></FormControl><SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                             <FormField control={form.control} name="team_b_id" render={({ field }) => (<FormItem><FormLabel>Team B</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Team B" /></SelectTrigger></FormControl><SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
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

export default function SportsHeadMatchesPage() {
    const [matches, setMatches] = useState<ApiMatch[]>([]);
    const [teams, setTeams] = useState<SportsHeadTeam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    // In a real app, this would come from user session
    const assignedSportId = localStorage.getItem('assigned_sport_id');

    const fetchMatchesAndTeams = async () => {
        if (!assignedSportId) return;
        setIsLoading(true);
        try {
            const [matchesData, teamsData] = await Promise.all([
                getSportsHeadMatches(),
                getSportsHeadTeams()
            ]);
            setMatches(matchesData);
            setTeams(teamsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch data.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMatchesAndTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scheduled = matches.filter(m => m.status === 'scheduled');
    const live = matches.filter(m => m.status === 'live');
    const completed = matches.filter(m => m.status === 'completed');

    return (
        <div className="container py-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Match Management</CardTitle>
                            <CardDescription>Schedule new matches and view existing ones for your sport.</CardDescription>
                        </div>
                        {assignedSportId && <ScheduleMatchDialog onMatchCreated={fetchMatchesAndTeams} teams={teams} sportId={assignedSportId}/>}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-48 w-full" /> : (
                         <Tabs defaultValue="scheduled">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
                                <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
                                <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="scheduled" className="space-y-4 mt-4">
                                {scheduled.length > 0 ? scheduled.map(m => <MatchCard key={m.id} match={m} />) : <p className="text-center text-muted-foreground py-8">No matches scheduled.</p>}
                            </TabsContent>
                             <TabsContent value="live" className="space-y-4 mt-4">
                                {live.length > 0 ? live.map(m => <MatchCard key={m.id} match={m} />) : <p className="text-center text-muted-foreground py-8">No matches are currently live.</p>}
                            </TabsContent>
                             <TabsContent value="completed" className="space-y-4 mt-4">
                                {completed.length > 0 ? completed.map(m => <MatchCard key={m.id} match={m} />) : <p className="text-center text-muted-foreground py-8">No matches have been completed yet.</p>}
                            </TabsContent>
                         </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
