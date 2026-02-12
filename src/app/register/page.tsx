import { redirect } from 'next/navigation';

export default function OldRegisterPage() {
    redirect('/registration');
    return null;
}
