import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/energy/2026/players/${id}`);
}
