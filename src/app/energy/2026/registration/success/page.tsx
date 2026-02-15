

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, Download, ArrowRight, User, Mail, Phone, IndianRupee, Dribbble, FileText } from 'lucide-react';
import { getRegistration, type Registration } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ShareButton } from '@/components/shared/share-button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = 'https://energy-sports-meet-backend.onrender.com/api/v1';

function InfoDetail({ icon: Icon, label, value, isMono = false, children }: { icon?: React.ElementType, label: string, value?: string | null, isMono?: boolean, children?: React.ReactNode }) {
    if (!value && !children) return null;
    return (
        <div className="flex items-start gap-3">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                {value && <p className={cn("font-medium break-words", isMono && "font-mono")}>{value}</p>}
                {children}
            </div>
        </div>
    )
}


function SuccessPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const registrationCode = searchParams.get('id');

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!registrationCode) {
            router.replace('/energy/2026/registration');
            return;
        }

        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const data = await getRegistration(registrationCode);
                setRegistration(data);
            } catch (error) {
                console.error("Failed to fetch registration details on success page:", error);
                toast({
                    variant: 'destructive',
                    title: "Could not load details",
                    description: "Your registration was submitted, but we couldn't fetch the details right now."
                })
            } finally {
                setIsLoading(false);
            }
        }

        fetchDetails();
    }, [registrationCode, router, toast]);

    if (isLoading || !registrationCode) {
        return <LoadingSkeleton />;
    }
    
    if (!registration) {
         return (
             <>
                <CardHeader className="text-center items-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold font-headline">Registration Submitted!</CardTitle>
                        <CardDescription>
                            Your registration code is <span className="font-mono">{registrationCode}</span>. You
                            will receive a confirmation email shortly.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">Could not load full details. You can still access them later from the student portal.</p>
                </CardContent>
                <CardFooter className="flex-col gap-2 pt-4">
                     <Button asChild className="w-full">
                        <Link href="/energy/2026/auth">Login to Portal <ArrowRight className="ml-2"/></Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href="/energy/2026">Back to Home</Link>
                    </Button>
                </CardFooter>
            </>
         );
    }
    
    const ticketUrl = `${API_BASE_URL}/register/${registration.id}/ticket`;
    const detailsUrl = `/energy/2026/registration/details?id=${registration.registration_code}`;
    const absoluteDetailsUrl = typeof window !== 'undefined' ? `${window.location.origin}${detailsUrl}` : detailsUrl;

    return (
        <>
            <CardHeader className="text-center items-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold font-headline">Registration Submitted!</CardTitle>
                    <CardDescription>
                        Your registration is successful. Your details are below.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="border bg-muted/50 rounded-lg p-4 space-y-4">
                    <InfoDetail icon={User} label="Name" value={registration.Student.name} />
                    <InfoDetail icon={Mail} label="Email" value={registration.Student.email} />
                    <InfoDetail icon={Phone} label="Mobile" value={registration.Student.mobile} />
                    <InfoDetail icon={IndianRupee} label="Amount Paid" value={`₹${registration.Payment?.amount || '0.00'}`} />
                     <InfoDetail icon={Dribbble} label="Registered Sports">
                        <div className="flex flex-wrap gap-2 pt-1">
                            {registration.Sports?.map(sport => (
                                <Badge key={sport.id} variant="secondary">{sport.name}</Badge>
                            ))}
                        </div>
                    </InfoDetail>
                </div>

                <div className="space-y-2">
                     <Button asChild className="w-full">
                        <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2" />
                            Download Ticket
                        </a>
                    </Button>
                    <ShareButton 
                        url={absoluteDetailsUrl}
                        title={`Registration for ENERGY 2026`}
                        text={`Check out the registration details for ${registration.Student.name} in the ENERGY 2026 Sports Meet.`}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 border-t pt-6">
                <Button asChild className="w-full">
                    <Link href={detailsUrl}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                    </Link>
                </Button>
                 <Button asChild className="w-full" variant="outline">
                    <Link href="/energy/2026/auth">Login to Your Portal <ArrowRight className="ml-2"/></Link>
                </Button>
                 <Button asChild variant="link">
                    <Link href="/energy/2026">Back to Home</Link>
                </Button>
            </CardFooter>
        </>
    );
}

function LoadingSkeleton() {
    return (
        <div className="p-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">Finalizing your registration...</p>
        </div>
    );
}

export default function RegistrationSuccessPage() {
    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <Suspense fallback={<LoadingSkeleton />}>
                    <SuccessPageContent />
                </Suspense>
            </Card>
        </div>
    );
}
