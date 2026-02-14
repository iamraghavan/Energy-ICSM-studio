
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRegistration, type Registration } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, User, Building, Dribbble, Hash, Users as UsersIcon, Bed, UserCheck, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function RegistrationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const registrationId = params.registrationId as string;
    
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!registrationId) return;

        const fetchRegistration = async () => {
            setIsLoading(true);
            try {
                const data = await getRegistration(registrationId);
                setRegistration(Array.isArray(data) ? data[0] : data);
            } catch (err: any) {
                setError("Failed to fetch registration details.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistration();
    }, [registrationId]);

    if (isLoading) {
        return <RegistrationDetailsSkeleton />;
    }

    if (error || !registration) {
        return (
            <div className="container py-8 text-center">
                <p className="text-destructive">{error || "Registration not found."}</p>
                <Button onClick={() => router.push('/admin/registrations')} variant="outline" className="mt-4">Go Back</Button>
            </div>
        );
    }
    
    const { Student, Sport, Team, Payment, registration_code, payment_status, accommodation_needed, is_captain, status, created_at } = registration;

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/admin/registrations')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Registration Details</h1>
                    <p className="text-muted-foreground">Details for registration code: <span className="font-mono">{registration_code}</span></p>
                </div>
                 <Badge
                    variant={
                        payment_status === 'approved' || payment_status === 'verified'
                        ? 'default'
                        : payment_status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="capitalize ml-auto"
                    >
                    Payment: {payment_status}
                </Badge>
                 <Badge
                    variant={
                        status === 'approved'
                        ? 'default'
                        : status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="capitalize"
                    >
                    Reg: {status}
                </Badge>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoDetail icon={User} label="Name" value={Student.name} />
                        {is_captain && <InfoDetail icon={UserCheck} label="Role" value="Team Captain" />}
                        <InfoDetail icon={Mail} label="Email" value={Student.email} />
                        <InfoDetail icon={Phone} label="Mobile" value={Student.mobile} />
                        <InfoDetail icon={Phone} label="WhatsApp" value={Student.whatsapp} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Academic Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoDetail icon={Building} label="College" value={Student.other_college || Student.College?.name || 'N/A'} />
                        <InfoDetail icon={Building} label="City" value={Student.city} />
                        <InfoDetail icon={Building} label="State" value={Student.state} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Event & Payment</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <InfoDetail icon={Dribbble} label="Sport" value={Sport?.name || 'N/A'} />
                         {Sport?.type && <InfoDetail icon={UsersIcon} label="Event Type" value={Sport.type} />}
                         {Team && <InfoDetail icon={UsersIcon} label="Team Name" value={Team.team_name} />}
                         <InfoDetail icon={Hash} label="Transaction ID" value={Payment?.txn_id || 'N/A'} isMono />
                         <InfoDetail label="Amount Paid" value={`₹${Payment?.amount || '0.00'}`} />
                         <InfoDetail icon={Clock} label="Registered On" value={format(new Date(created_at), 'PPP p')} />
                         <InfoDetail icon={Bed} label="Accommodation" value={accommodation_needed ? "Requested" : "Not Requested"} />
                    </CardContent>
                </Card>

                {Payment?.screenshot_url && (
                    <Card className="md:col-span-2 lg:col-span-3">
                         <CardHeader><CardTitle>Payment Screenshot</CardTitle></CardHeader>
                         <CardContent className="flex justify-center p-4 bg-muted/50 rounded-lg">
                            <Image src={Payment.screenshot_url} alt="Payment Screenshot" width={300} height={600} className="rounded-md border object-contain"/>
                         </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function InfoDetail({ icon: Icon, label, value, isMono = false }: { icon?: React.ElementType, label: string, value: string | null, isMono?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={cn("font-medium break-words", isMono && "font-mono")}>{value}</p>
            </div>
        </div>
    )
}

function RegistrationDetailsSkeleton() {
    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
            </div>
        </div>
    );
}
