import { redirect } from 'next/navigation';
import { Suspense } from 'react';

function Redirector({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const params = new URLSearchParams();
    if (searchParams?.id) {
        params.set('id', Array.isArray(searchParams.id) ? searchParams.id[0] : searchParams.id);
    }
    redirect(`/energy/2026/registration/success?${params.toString()}`);
    return null;
}

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
        <Suspense>
            <Redirector searchParams={searchParams} />
        </Suspense>
    );
}
