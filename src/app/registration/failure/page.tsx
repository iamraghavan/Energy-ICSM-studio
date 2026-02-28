import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function Redirector({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const sp = await searchParams;
    const params = new URLSearchParams();
    if (sp?.error) {
        params.set('error', Array.isArray(sp.error) ? sp.error[0] : sp.error);
    }
    redirect(`/energy/2026/registration/failure?${params.toString()}`);
    return null;
}

export default function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    return (
        <Suspense>
            <Redirector searchParams={searchParams} />
        </Suspense>
    );
}
