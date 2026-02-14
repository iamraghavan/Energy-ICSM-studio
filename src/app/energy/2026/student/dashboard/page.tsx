'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentSession, type StudentSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<StudentSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const studentSession = getStudentSession();
        if (!studentSession) {
            router.replace('/energy/2026/auth?action=login');
        } else {
            setSession(studentSession);
            setIsLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('student_token');
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/energy/2026');
    };

    if (isLoading || !session) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Welcome, {session.name}!</h1>
                <p className="text-muted-foreground mt-2">This is your student dashboard.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>My Registrations</CardTitle>
                    <CardDescription>View your event registrations here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Registration details will be shown here soon.</p>
                </CardContent>
            </Card>
            
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleLogout}>Logout</Button>
                </CardContent>
            </Card>
        </div>
    );
}
