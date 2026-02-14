'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';


function SuccessPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const registrationId = searchParams.get('id');

    useEffect(() => {
        // Redirect if no ID is present, to avoid showing an empty state.
        if (!registrationId) {
            router.replace('/energy/2026/registration');
        }
    }, [registrationId, router]);

    if (!registrationId) {
        // Show loading skeleton while router effect is processed.
        return <LoadingSkeleton />;
    }

    return (
        <>
            <CardHeader className="text-center items-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold font-headline">Registration Submitted!</CardTitle>
                    <CardDescription>
                        Your registration code is <span className="font-mono">{registrationId}</span>. You
                        will receive a confirmation email shortly.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardFooter className="justify-center pt-4">
                <Button asChild variant="link">
                    <Link href="/energy/2026">Back to Home</Link>
                </Button>
            </CardFooter>
        </>
    );
}

function LoadingSkeleton() {
    return (
        <div className="p-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
}

export default function RegistrationSuccessPage() {
    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <Suspense fallback={<LoadingSkeleton />}>
                    <SuccessPageContent />
                </Suspense>
            </Card>
        </div>
    );
}
