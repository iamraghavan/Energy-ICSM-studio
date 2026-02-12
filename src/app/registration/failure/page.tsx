'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function FailureContent() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('error');

    return (
        <>
            {errorMessage && (
                <div className="border rounded-lg p-3 bg-destructive/10 text-destructive text-sm">
                    <p className="font-semibold">Error Details:</p>
                    <p>{decodeURIComponent(errorMessage)}</p>
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="w-full">
                    <Link href="/registration">Try Again</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </>
    );
}

function FailureSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <div className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}

export default function RegistrationFailurePage() {
    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="items-center">
                    <XCircle className="h-16 w-16 text-destructive" />
                    <CardTitle className="text-2xl font-bold font-headline mt-4 text-destructive">Registration Failed</CardTitle>
                    <CardDescription>
                        Unfortunately, we were unable to process your registration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Suspense fallback={<FailureSkeleton />}>
                        <FailureContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
