'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Search, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { searchCommitteeRegistrations, checkInStudent, type Registration } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function CommitteeDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [foundRegistrations, setFoundRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsLoading(true);
        setError('');
        setFoundRegistrations([]);

        try {
            const data = await searchCommitteeRegistrations(searchQuery);
            setFoundRegistrations(data);
            if (data.length === 0) {
                setError('No registrations found matching your query.');
            }
        } catch (err) {
            setError('Failed to search registrations.');
            toast({ variant: 'destructive', title: 'Search Failed', description: 'Could not perform search.'});
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCheckIn = async (registrationId: string, studentName: string) => {
        try {
            await checkInStudent(registrationId);
            setFoundRegistrations(prev => 
                prev.map(reg => reg.id === registrationId ? { ...reg, status: 'approved' } : reg)
            );
            toast({ title: 'Success', description: `${studentName} has been checked in.` });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Check-in Failed', description: 'Could not update registration status.' });
        }
    }

    return (
        <div className="container py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Participant Check-in</CardTitle>
                    <CardDescription>Enter a participant's name, email, or registration code to find and check them in.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input 
                            placeholder="Search name, email, or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                            <span className="sr-only">Search</span>
                        </Button>
                    </form>
                    
                    {isLoading && <div className="text-center p-4"><Loader2 className="mx-auto animate-spin" /></div>}
                    
                    {error && !isLoading && <div className="text-center text-destructive p-4"><AlertTriangle className="mx-auto mb-2" />{error}</div>}

                    {foundRegistrations.length > 0 && (
                        <div className="space-y-4">
                            {foundRegistrations.map(registration => (
                                <Card key={registration.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            {registration.Student.name}
                                            <Badge variant={registration.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{registration.status}</Badge>
                                        </CardTitle>
                                        <CardDescription>{registration.registration_code}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                       <p><span className="font-semibold">College:</span> {registration.college_name}</p>
                                       <p><span className="font-semibold">Registered On:</span> {format(new Date(registration.created_at), 'PPP')}</p>
                                       <div>
                                           <p className="font-semibold">Sports:</p>
                                           <ul className="list-disc pl-5">
                                               {registration.Sports.map(s => <li key={s.id}>{s.name} ({s.category})</li>)}
                                           </ul>
                                       </div>
                                    </CardContent>
                                     <CardFooter>
                                        <Button 
                                            className="w-full" 
                                            onClick={() => handleCheckIn(registration.id, registration.Student.name)} 
                                            disabled={registration.status === 'approved'}
                                        >
                                            <CheckCircle className="mr-2"/>
                                            {registration.status === 'approved' ? 'Already Checked In' : 'Confirm Check-in'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
