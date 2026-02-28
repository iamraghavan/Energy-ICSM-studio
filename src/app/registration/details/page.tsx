import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const sp = await searchParams;
    const params = new URLSearchParams();
    if (sp?.id) {
        params.set('id', Array.isArray(sp.id) ? sp.id[0] : sp.id);
    }
    redirect(`/energy/2026/registration/details?${params.toString()}`);
}
