'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRegistration, verifyPayment, type Registration } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function InfoRow({ label, value, isMono = false }: { label: string, value: string | undefined | null, isMono?: boolean }) {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("font-medium text-base", isMono && "font-mono")}>{value}</p>
        </div>
    )
}

function VerifyPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registrationId = searchParams.get('id');
    const { toast } = useToast();

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [action, setAction] = useState<'approved' | 'rejected' | null>(null);
    const [remarks, setRemarks] = useState('');

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
                if (data.payment_status !== 'pending') {
                    setError('This payment has already been processed.');
                }
            } catch (err) {
                setError("Failed to fetch registration details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistration();
    }, [registrationId]);

    const handleVerify = async (status: 'approved' | 'rejected') => {
        if (!registration) return;
        setIsVerifying(true);
        setAction(status);
        try {
            await verifyPayment(registration.registration_code, status, remarks);
            toast({
                title: 'Success!',
                description: `Payment has been ${status}.`
            });
            router.push('/console/admin/payments');
        } catch (err: any) {
             toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: err.response?.data?.message || 'Could not update payment status.',
            });
             setIsVerifying(false);
             setAction(null);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-8 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div></CardContent></Card>
                    <Card><CardHeader><CardTitle>Payment Screenshot</CardTitle></CardHeader><CardContent className="flex items-center justify-center h-96"><Skeleton className="w-full h-full" /></CardContent></Card>
                </div>
            </div>
        )
    }
    
    if (error || !registration) {
        return (
            <div className="container py-8 text-center">
                 <p className="text-destructive">{error || 'Registration not found'}</p>
                 <Button variant="outline" className="mt-4" onClick={() => router.back()}><ArrowLeft className="mr-2"/> Go Back</Button>
            </div>
        )
    }

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" onClick={() => router.push('/console/admin/payments')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Verify Payment</h1>
                    <p className="text-muted-foreground">Review and approve/reject the payment for <span className="font-semibold text-foreground">{registration.name}</span></p>
                </div>
                <Badge variant="secondary" className="ml-auto capitalize">{registration.payment_status}</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Registration Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow label="Registration Code" value={registration.registration_code} isMono />
                        <InfoRow label="Student Name" value={registration.name} />
                        <InfoRow label="Email" value={registration.email} />
                        <InfoRow label="College" value={registration.college_name} />
                        <InfoRow label="Sports" value={registration.Sports?.map(s => s.name).join(', ')} />
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Payment Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <InfoRow label="Transaction ID" value={registration.Payment?.txn_id} isMono />
                        <InfoRow label="Amount Paid" value={registration.Payment?.amount ? `₹${registration.Payment.amount}` : 'N/A'} />
                        
                        <div className="pt-4 border-t">
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Add optional remarks for this verification..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="mt-2"
                                disabled={isVerifying}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button variant="destructive" onClick={() => handleVerify('rejected')} disabled={isVerifying} className="w-full">
                            {isVerifying && action === 'rejected' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <X className="mr-2"/> Reject
                        </Button>
                        <Button onClick={() => handleVerify('approved')} disabled={isVerifying} className="w-full">
                             {isVerifying && action === 'approved' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Check className="mr-2"/> Approve
                        </Button>
                    </CardFooter>
                </Card>
                 <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Payment Screenshot</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center p-2 bg-muted/50">
                        {registration.Payment?.screenshot_url ? (
                            <Image src={registration.Payment.screenshot_url} alt="Payment Screenshot" width={300} height={600} className="rounded-md border object-contain"/>
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No screenshot provided.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyPaymentContent />
        </Suspense>
    );
}
