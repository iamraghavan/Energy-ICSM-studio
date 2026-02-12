import { redirect } from 'next/navigation';

export default function Page({ params }: { params: { id: string } }) {
    redirect(`/energy/2026/players/${params.id}`);
}
