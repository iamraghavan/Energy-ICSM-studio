import { redirect } from 'next/navigation';
// This component is deprecated, but we'll create a redirect just in case.
export default function Page() {
    redirect('/registration');
}
