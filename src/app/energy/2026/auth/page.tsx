'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/shared/logo';
import { Loader2 } from 'lucide-react';
import { requestStudentOtp, verifyStudentOtp } from '@/lib/api';

const requestOtpSchema = z.object({
  identifier: z.string().min(1, { message: "Please enter your email or WhatsApp number." }),
});
type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;

const verifyOtpSchema = z.object({
    otp: z.string().length(6, { message: "OTP must be 6 digits."}),
});
type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;


function StudentAuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [identifier, setIdentifier] = useState('');
  
  const requestForm = useForm<RequestOtpFormValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { identifier: '' },
  });

  const verifyForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  const handleRequestOtp = async (data: RequestOtpFormValues) => {
    setIsSubmitting(true);
    try {
      await requestStudentOtp(data.identifier);
      setIdentifier(data.identifier);
      setStep('verify');
      toast({
        title: 'OTP Sent!',
        description: 'Please check your email or WhatsApp for the OTP.',
      });
    } catch (error: any) {
      if (error.response?.data?.needsRegistration) {
         toast({
          variant: 'destructive',
          title: 'Registration Not Found',
          description: "Please register first to create your account.",
        });
        router.push('/energy/2026/registration');
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Send OTP',
          description: error.response?.data?.message || 'An error occurred. Please try again.',
        });
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpFormValues) => {
    setIsSubmitting(true);
    try {
        const response = await verifyStudentOtp(identifier, data.otp);
        localStorage.setItem('student_token', response.token);
        toast({
            title: 'Login Successful!',
            description: `Welcome back, ${response.name}!`,
        });
        router.push('/energy/2026'); // Or a student dashboard later
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Invalid OTP',
            description: error.response?.data?.message || 'The OTP you entered is incorrect. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto">
                <Logo />
            </div>
            <CardTitle className="font-headline text-2xl mt-4">Student Login</CardTitle>
        </CardHeader>
        <CardContent>
            {step === 'request' && (
                <>
                <CardDescription className="text-center mb-4">Enter the email or WhatsApp number you used during registration.</CardDescription>
                <Form {...requestForm}>
                    <form onSubmit={requestForm.handleSubmit(handleRequestOtp)} className="space-y-4">
                    <FormField
                        control={requestForm.control}
                        name="identifier"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email or WhatsApp Number</FormLabel>
                            <FormControl>
                            <Input
                                placeholder="you@example.com or 9876543210"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send OTP
                    </Button>
                    </form>
                </Form>
                </>
            )}

            {step === 'verify' && (
                 <>
                <CardDescription className="text-center mb-4">An OTP has been sent to <span className="font-semibold">{identifier}</span>. Please enter it below.</CardDescription>
                <Form {...verifyForm}>
                    <form onSubmit={verifyForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                    <FormField
                        control={verifyForm.control}
                        name="otp"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>6-Digit OTP</FormLabel>
                            <FormControl>
                            <Input
                                placeholder="123456"
                                maxLength={6}
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify & Login
                    </Button>
                    </form>
                </Form>
                <Button variant="link" size="sm" className="mt-4 w-full" onClick={() => {
                    setStep('request');
                    setIdentifier('');
                }}>
                    Use a different email/number
                </Button>
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function StudentAuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudentAuthForm />
        </Suspense>
    )
}
