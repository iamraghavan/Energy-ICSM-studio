import { redirect } from 'next/navigation';
import { useSearchParams } from 'next/navigation'

export default function Page() {
    const searchParams = useSearchParams();
    redirect(`/registration/failure?${searchParams.toString()}`);
}
