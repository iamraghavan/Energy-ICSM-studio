'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Search, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getRegistration, type Registration, verifyPayment } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function CommitteeDashboard() {
    const [registrationCode, setRegistrationCode] = useState('');
    const [foundRegistration, setFoundRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!registrationCode) return;

        setIsLoading(true);
        setError('');
        setFoundRegistration(null);

        try {
            const data = await getRegistration(registrationCode);
            setFoundRegistration(data);
        } catch (err) {
            setError('Registration not found.');
            toast({ variant: 'destructive', title: 'Not Found', description: 'No registration matches that code.'});
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCheckIn = async () => {
        if (!foundRegistration) return;
        
        try {
            // Using 'approved' status to mean "checked-in"
            await verifyPayment(foundRegistration.registration_code, 'approved', 'Checked in by committee member.');
            setFoundRegistration(prev => prev ? ({ ...prev, status: 'approved' }) : null);
            toast({ title: 'Success', description: `${foundRegistration.Student.name} has been checked in.` });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Check-in Failed', description: 'Could not update registration status.' });
        }
    }

    return (
        <div className="container py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Participant Check-in</CardTitle>
                    <CardDescription>Scan a participant's QR code or enter their registration code to check them in.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input 
                            placeholder="Enter Registration Code..."
                            value={registrationCode}
                            onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                            <span className="sr-only">Search</span>
                        </Button>
                    </form>
                    
                    {error && <div className="text-center text-destructive p-4"><AlertTriangle className="mx-auto mb-2" />{error}</div>}

                    {foundRegistration && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {foundRegistration.Student.name}
                                    <Badge variant={foundRegistration.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{foundRegistration.status}</Badge>
                                </CardTitle>
                                <CardDescription>{foundRegistration.Student.email}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                               <p><span className="font-semibold">College:</span> {foundRegistration.college_name}</p>
                               <p><span className="font-semibold">Registered On:</span> {format(new Date(foundRegistration.created_at), 'PPP')}</p>
                               <div>
                                   <p className="font-semibold">Sports:</p>
                                   <ul className="list-disc pl-5">
                                       {foundRegistration.Sports.map(s => <li key={s.id}>{s.name} ({s.category})</li>)}
                                   </ul>
                               </div>
                            </CardContent>
                             <CardFooter>
                                <Button className="w-full" onClick={handleCheckIn} disabled={foundRegistration.status === 'approved'}>
                                    <CheckCircle className="mr-2"/>
                                    {foundRegistration.status === 'approved' ? 'Already Checked In' : 'Confirm Check-in'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
