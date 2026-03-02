
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = await params;
    redirect(`/energy/2026/matches/${matchId}`);
}
