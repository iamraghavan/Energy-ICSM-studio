'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, ExternalLink, Loader2 } from 'lucide-react';
import { getRegistration, type Registration } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

function SuccessDetails({ registration }: { registration: Registration }) {
    const ticketUrl = `${API_BASE_URL}/register/${registration.id}/ticket`;
    const detailsUrl = `/energy/2026/registration/details?id=${registration.registration_code}&public=yes`;
    
    return (
        <>
            <CardHeader className="text-center items-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <CardTitle className="text-2xl font-bold font-headline mt-4">Registration Successful!</CardTitle>
                <CardDescription>
                    Your registration has been submitted. A confirmation has been sent to your email.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold">{registration.Student.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration Code:</span>
                        <span className="font-mono font-semibold">{registration.registration_code}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sport:</span>
                        <span className="font-semibold">{registration.Sport?.name}</span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild className="w-full">
                        <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download Ticket
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={detailsUrl}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Full Details
                        </Link>
                    </Button>
                </div>
                <div className="text-center pt-4">
                    <Button asChild variant="link">
                        <Link href="/energy/2026">Back to Home</Link>
                    </Button>
                </div>
            </CardContent>
        </>
    )
}

export default function RegistrationSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const registrationId = searchParams.get('id');
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!registrationId) {
            router.replace('/energy/2026/registration');
            return;
        }

        getRegistration(registrationId)
            .then(data => {
                setRegistration(data);
            })
            .catch(err => {
                console.error("Failed to fetch registration details:", err);
                setError("Could not load registration summary.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [registrationId, router]);

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                {isLoading && (
                    <div className="p-8 text-center space-y-4">
                        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                        <p className="text-muted-foreground">Finalizing your registration...</p>
                    </div>
                )}
                {error && !isLoading && (
                     <CardHeader className="text-center items-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <CardTitle className="text-2xl font-bold font-headline mt-4">Registration Submitted!</CardTitle>
                        <CardDescription>
                            Your registration code is <span className="font-mono">{registrationId}</span>. You will receive a confirmation email shortly.
                        </CardDescription>
                         <div className="pt-4">
                            <Button asChild variant="link">
                                <Link href="/energy/2026">Back to Home</Link>
                            </Button>
                        </div>
                    </CardHeader>
                )}
                {registration && !isLoading && <SuccessDetails registration={registration} />}
            </Card>
        </div>
    );
}
