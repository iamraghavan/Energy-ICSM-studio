import { redirect } from 'next/navigation';
import { useSearchParams, usePathname } from 'next/navigation'

export default function Page() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    redirect(`/registration/details?${searchParams.toString()}`);
}
