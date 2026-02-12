'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession } from '@/lib/auth';

export default function ConsoleRootPage() {
    const router = useRouter();

    useEffect(() => {
        const session = getUserSession();
        if (session) {
            router.replace('/console/dashboard');
        } else {
            router.replace('/auth/session');
        }
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading console...</p>
        </div>
    );
}
