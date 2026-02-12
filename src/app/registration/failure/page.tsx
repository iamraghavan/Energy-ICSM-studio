import { redirect } from 'next/navigation';
import { Suspense } from 'react';

function Redirector({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const params = new URLSearchParams();
    if (searchParams?.error) {
        params.set('error', Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error);
    }
    redirect(`/energy/2026/registration/failure?${params.toString()}`);
    return null;
}

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
        <Suspense>
            <Redirector searchParams={searchParams} />
        </Suspense>
    );
}
