
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { getSportsHeadTeams, createSportsHeadTeam, type SportsHeadTeam } from "@/lib/api";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const teamFormSchema = z.object({
  team_name: z.string().min(3, 'Team name must be at least 3 characters long.'),
});

function CreateTeamDialog({ onTeamCreated }: { onTeamCreated: () => void }) {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const form = useForm<z.infer<typeof teamFormSchema>>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: { team_name: '' },
    });

    const onSubmit = async (values: z.infer<typeof teamFormSchema>) => {
        try {
            await createSportsHeadTeam(values);
            toast({ title: 'Team Created', description: `${values.team_name} has been created.` });
            onTeamCreated();
            setIsModalOpen(false);
            form.reset();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create team.' });
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4"/>Create Team</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>Create a new team for your sport. You can add players later.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="team_name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Team Name</FormLabel>
                                <FormControl><Input placeholder="e.g. College Strikers" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


export default function SportsHeadTeamsPage() {
    const [teams, setTeams] = useState<SportsHeadTeam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchTeams = async () => {
        setIsLoading(true);
        try {
            const teamsData = await getSportsHeadTeams();
            setTeams(teamsData);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch teams.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    return (
        <div className="container py-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Team Management</CardTitle>
                            <CardDescription>View and manage all teams for your assigned sport.</CardDescription>
                        </div>
                        <CreateTeamDialog onTeamCreated={fetchTeams} />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : teams.length > 0 ? (
                         <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Team Name</TableHead>
                                        <TableHead>Captain</TableHead>
                                        <TableHead>Player Count</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teams.map(team => (
                                        <TableRow key={team.id}>
                                            <TableCell className="font-medium">{team.team_name}</TableCell>
                                            <TableCell>{team.Captain?.name || 'Not Assigned'}</TableCell>
                                            <TableCell>{team._count.Members}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm">Manage</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground border rounded-lg">
                            <Users className="h-12 w-12 mx-auto mb-4" />
                            <p className="font-medium">No teams found for this sport.</p>
                            <p className="text-sm">Click "Create Team" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
