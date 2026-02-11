import { getRegistration, type Registration } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, User, Building, Milestone, Dribbble, Calendar, Hash, FileText, Users as UsersIcon, Bed, UserCheck, Clock, Download, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

function InfoDetail({ icon: Icon, label, value, isMono = false }: { icon?: React.ElementType, label: string, value: string | null | undefined, isMono?: boolean }) {
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

export default async function PublicRegistrationDetailsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
    const registrationId = searchParams.id as string;
    
    let registration: Registration | null = null;
    let error: string | null = null;

    if (!registrationId) {
        error = "No registration ID provided.";
    } else {
        try {
            registration = await getRegistration(registrationId);
        } catch (err) {
            console.error("Failed to fetch public registration details:", err);
            error = "Could not find registration details for the provided ID.";
        }
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
                            <Link href="/energy/2026">Back to Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { Student, Sport, Team, Payment, registration_code, payment_status, accommodation_needed, is_captain, status, created_at } = registration;
    const ticketUrl = `${API_BASE_URL}/register/${registration.id}/ticket`;

    return (
        <div className="container py-8 space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                 <div>
                    <h1 className="text-2xl font-bold">Registration Details</h1>
                    <p className="text-muted-foreground">Public view for registration code: <span className="font-mono">{registration_code}</span></p>
                </div>
                 <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-auto">
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
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoDetail icon={User} label="Name" value={Student.name} />
                        {is_captain && <InfoDetail icon={UserCheck} label="Role" value="Team Captain" />}
                        <InfoDetail icon={Mail} label="Email" value={Student.email} />
                        <InfoDetail icon={Phone} label="Mobile" value={Student.mobile} />
                        <InfoDetail icon={Phone} label="WhatsApp" value={Student.whatsapp} />
                        <InfoDetail icon={Calendar} label="Date of Birth" value={format(new Date(Student.dob), 'PPP')} />
                        <InfoDetail icon={User} label="Gender" value={Student.gender} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Academic Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoDetail icon={Building} label="College" value={Student.other_college || Student.College?.name || 'N/A'} />
                         <InfoDetail icon={FileText} label="Department" value={Student.department} />
                        <InfoDetail icon={Milestone} label="Year of Study" value={Student.year_of_study} />
                        <InfoDetail icon={Building} label="City" value={Student.city} />
                        <InfoDetail icon={Building} label="State" value={Student.state} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Event & Ticket</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <InfoDetail icon={Dribbble} label="Sport" value={Sport?.name || 'N/A'} />
                         {Sport?.type && <InfoDetail icon={UsersIcon} label="Event Type" value={Sport.type} />}
                         {Team && <InfoDetail icon={UsersIcon} label="Team Name" value={Team.team_name} />}
                         <InfoDetail icon={Clock} label="Registered On" value={format(new Date(created_at), 'PPP p')} />
                         <InfoDetail icon={Bed} label="Accommodation" value={accommodation_needed ? "Requested" : "Not Requested"} />
                         <div className="pt-4">
                            <Button asChild className="w-full">
                                <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Ticket
                                </a>
                            </Button>
                         </div>
                    </CardContent>
                </Card>

                 {Payment && (
                     <Card className="md:col-span-3">
                        <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-4">
                                <InfoDetail label="Payment Status" value={payment_status} />
                                <InfoDetail icon={Hash} label="Transaction ID" value={Payment?.txn_id || 'N/A'} isMono />
                                <InfoDetail label="Amount Paid" value={`₹${Payment?.amount || '0.00'}`} />
                            </div>
                            {Payment.screenshot_url && (
                                <div className="flex justify-center md:justify-end">
                                    <Image src={Payment.screenshot_url} alt="Payment Screenshot" width={200} height={400} className="rounded-md border object-contain"/>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 )}
            </div>
        </div>
    );
}
