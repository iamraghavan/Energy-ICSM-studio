'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

function FailureContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
         <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center items-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                    <CardTitle className="text-destructive mt-4">Registration Failed</CardTitle>
                    <CardDescription>
                        Unfortunately, there was an issue processing your registration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                         <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                            <p className="text-sm font-medium text-destructive">Error Message:</p>
                            <p className="text-sm text-destructive/90 break-words">{decodeURIComponent(error)}</p>
                        </div>
                    )}
                     <div className="flex flex-col gap-2">
                        <Button asChild>
                            <Link href="/energy/2026/registration">Try Again</Link>
                        </Button>
                         <Button asChild variant="link">
                            <Link href="/energy/2026">Back to Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function RegistrationFailurePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FailureContent />
        </Suspense>
    );
}
export default RegistrationFailurePage;
