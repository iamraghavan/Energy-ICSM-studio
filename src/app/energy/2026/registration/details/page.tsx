'use client';
import { getRegistration, type Registration } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User, Building, Dribbble, Hash, Users as UsersIcon, Bed, UserCheck, Clock, Download, AlertTriangle, FileBadge } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareButton } from '@/components/shared/share-button';


const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

function InfoDetail({ icon: Icon, label, value, isMono = false }: { icon?: React.ElementType, label: string, value: string | null | undefined, isMono?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />}
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={cn("font-medium break-words", isMono && "font-mono")}>{value}</p>
            </div>
        </div>
    )
}

function RegistrationClientActions({ ticketUrl, detailsUrl, registration }: { ticketUrl: string; detailsUrl: string; registration: Registration }) {
    const [absoluteDetailsUrl, setAbsoluteDetailsUrl] = useState('');

    useEffect(() => {
        setAbsoluteDetailsUrl(`${window.location.origin}${detailsUrl}`);
    }, [detailsUrl]);
    
    return (
        <div className="space-y-2 pt-4">
             <Button asChild className="w-full">
                <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Ticket
                </a>
            </Button>
            <ShareButton
                url={absoluteDetailsUrl}
                title={`Registration for ENERGY 2026`}
                text={`Check out the registration details for ${registration.Student.name} in the ENERGY 2026 Sports Meet.`}
            />
        </div>
    );
}

function RegistrationDetailsSkeleton() {
    return (
        <div className="container py-6 md:py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                 <div className="flex gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
            </div>
        </div>
    )
}

function PublicRegistrationDetailsContent() {
    const searchParams = useSearchParams();
    const registrationId = searchParams.get('id');

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        if (!registrationId) {
            setError("No registration ID provided.");
            setIsLoading(false);
            return;
        }

        const fetchRegistration = async () => {
            setIsLoading(true);
            try {
                const data = await getRegistration(registrationId);
                setRegistration(data);
            } catch (err) {
                console.error("Failed to fetch public registration details:", err);
                setError("Could not find registration details for the provided ID.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistration();
    }, [registrationId]);

    if(isLoading) {
        return <RegistrationDetailsSkeleton />;
    }
    
    if (error || !registration) {
         return (
            <div className="container py-8">
                <Card>
                    <CardHeader className="text-center items-center">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                        <CardTitle className="text-destructive mt-4">Registration Not Found</CardTitle>
                        <CardDescription>
                           {error || 'The registration details could not be loaded. The ID may be incorrect or the registration was not found.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                         <Button asChild variant="outline">
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { Student, Sports, Team, Payment, registration_code, payment_status, accommodation_needed, is_captain, status, created_at } = registration;
    const ticketUrl = `${API_BASE_URL}/register/${registration.id}/ticket`;
    const detailsUrl = `/energy/2026/registration/details?id=${registration.registration_code}`;

    return (
        <div className="container py-6 md:py-8 space-y-6">
             <div className="flex flex-wrap items-center justify-between gap-4">
                 <div>
                    <h1 className="text-2xl font-bold">Registration Details</h1>
                    <p className="text-sm text-muted-foreground">Code: <span className="font-mono">{registration_code}</span></p>
                </div>
                 <div className="flex gap-2">
                    <Badge
                        variant={
                            payment_status === 'approved' || payment_status === 'verified'
                            ? 'default'
                            : payment_status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="capitalize"
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
            </div>
            
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Participant Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoDetail icon={User} label="Name" value={Student.name} />
                        {is_captain && <InfoDetail icon={UserCheck} label="Role" value="Team Captain" />}
                        <InfoDetail icon={Mail} label="Email" value={Student.email} />
                        <InfoDetail icon={Phone} label="Mobile" value={Student.mobile} />
                        <InfoDetail icon={Phone} label="WhatsApp" value={Student.whatsapp} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Academic & Team Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoDetail icon={Building} label="College" value={registration.college_name} />
                        <InfoDetail icon={Building} label="City" value={registration.college_city} />
                        <InfoDetail icon={Building} label="State" value={registration.college_state} />
                        {Team && <InfoDetail icon={UsersIcon} label="Team Name" value={Team.team_name} />}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Event & Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <p className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-3"><Dribbble className="h-5 w-5" />Registered Events</p>
                            <div className="space-y-1 pl-8">
                                {Sports?.map(sport => (
                                    <p key={sport.id} className="font-medium">{sport.name} ({sport.category})</p>
                                ))}
                            </div>
                         </div>
                         <InfoDetail icon={Clock} label="Registered On" value={format(new Date(created_at), 'PPP p')} />
                         <InfoDetail icon={Bed} label="Accommodation" value={accommodation_needed ? "Requested" : "Not Requested"} />
                         <RegistrationClientActions ticketUrl={ticketUrl} detailsUrl={detailsUrl} registration={registration} />
                    </CardContent>
                </Card>

                 {registration.pd_name && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader><CardTitle>Physical Director Information</CardTitle></CardHeader>
                        <CardContent className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                             <InfoDetail icon={FileBadge} label="PD Name" value={registration.pd_name} />
                             <InfoDetail icon={Phone} label="PD WhatsApp" value={registration.pd_whatsapp} />
                             <InfoDetail icon={Mail} label="College Office Email" value={registration.college_email} />
                             <InfoDetail icon={Phone} label="College Contact No." value={registration.college_contact} />
                        </CardContent>
                    </Card>
                 )}

                 {Payment && (
                     <Card className="md:col-span-3">
                        <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                             <div className="space-y-4">
                                <InfoDetail label="Payment Status" value={payment_status} />
                                <InfoDetail icon={Hash} label="Transaction ID" value={Payment?.txn_id || 'N/A'} isMono />
                                <InfoDetail label="Amount Paid" value={`₹${Payment?.amount || '0.00'}`} />
                            </div>
                            {Payment.screenshot_url && (
                                <div className="flex justify-center md:justify-end">
                                    <Image src={Payment.screenshot_url} alt="Payment Screenshot" width={180} height={360} className="rounded-md border object-contain"/>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 )}
            </div>
        </div>
    );
}


export default function PublicRegistrationDetailsPage() {
    return (
        <Suspense fallback={<RegistrationDetailsSkeleton />}>
            <PublicRegistrationDetailsContent />
        </Suspense>
    );
}
