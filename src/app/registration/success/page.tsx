import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function Redirector({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const sp = await searchParams;
    const params = new URLSearchParams();
    if (sp?.id) {
        params.set('id', Array.isArray(sp.id) ? sp.id[0] : sp.id);
    }
    redirect(`/energy/2026/registration/success?${params.toString()}`);
    return null;
}

export default function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    return (
        <Suspense>
            <Redirector searchParams={searchParams} />
        </Suspense>
    );
}
