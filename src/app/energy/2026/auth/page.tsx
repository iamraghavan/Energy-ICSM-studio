
'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/shared/logo';
import { Loader2, Mail, KeyRound, Phone } from 'lucide-react';
import { requestStudentOtp, verifyStudentOtp } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Schemas for each login method
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const whatsappSchema = z.object({
  whatsapp: z.string().length(10, { message: "WhatsApp number must be 10 digits." }).regex(/^\d+$/, "Only digits are allowed."),
});
type WhatsappFormValues = z.infer<typeof whatsappSchema>;

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
  
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const whatsappForm = useForm<WhatsappFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: { whatsapp: '' },
  });

  const verifyForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  const handleApiError = (error: any) => {
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
  }

  const handleRequestOtp = async (id: string) => {
    setIsSubmitting(true);
    try {
      await requestStudentOtp(id);
      setIdentifier(id);
      setStep('verify');
      toast({
        title: 'OTP Sent!',
        description: 'Please check your email or WhatsApp for the OTP.',
      });
    } catch (error: any) {
      handleApiError(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpFormValues) => {
    setIsSubmitting(true);
    try {
        const responseData = await verifyStudentOtp(identifier, data.otp);
        
        if (responseData && responseData.token) {
            const token = responseData.token;
            const { token: _removedToken, ...sessionData } = responseData;

            localStorage.setItem('student_token', token);
            localStorage.setItem('student_session', JSON.stringify(sessionData));

            toast({
                title: 'Login Successful!',
                description: `Welcome back, ${responseData.name}!`,
            });
            window.location.href = '/energy/2026/student/dashboard';
        } else {
            throw new Error("Login failed: No token received from server.");
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.response?.data?.message || error.message || 'An error occurred during login.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo />
            </div>
            <CardTitle className="font-headline text-3xl mt-4">Student Portal</CardTitle>
        </CardHeader>
        <CardContent>
            {step === 'request' ? (
                <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4"/> Email</TabsTrigger>
                        <TabsTrigger value="whatsapp"><Phone className="mr-2 h-4 w-4"/> WhatsApp</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email">
                        <CardDescription className="text-center my-6">
                            Enter the email you used during registration to receive a login code.
                        </CardDescription>
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit((data) => handleRequestOtp(data.email))} className="space-y-6">
                                <FormField control={emailForm.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input type="email" placeholder="you@example.com" className="pl-10" {...field} />
                                            </div>
                                        </FormControl><FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send OTP
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="whatsapp">
                        <CardDescription className="text-center my-6">
                            Enter the WhatsApp number you used during registration to receive a login code.
                        </CardDescription>
                        <Form {...whatsappForm}>
                            <form onSubmit={whatsappForm.handleSubmit((data) => handleRequestOtp(data.whatsapp))} className="space-y-6">
                                <FormField control={whatsappForm.control} name="whatsapp" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">WhatsApp Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-muted-foreground">+91</span></div>
                                                <Input type="tel" placeholder="Enter 10-digit number" inputMode="numeric" maxLength={10} className="pl-12" {...field} />
                                            </div>
                                        </FormControl><FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send OTP
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            ) : (
                 <>
                <CardDescription className="text-center mb-6">
                    An OTP has been sent to <br/> <span className="font-semibold text-foreground">{identifier}</span>.
                </CardDescription>
                <Form {...verifyForm}>
                    <form onSubmit={verifyForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
                    <FormField
                        control={verifyForm.control}
                        name="otp"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">6-Digit OTP</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="123456"
                                    maxLength={6}
                                    className="pl-10 text-center tracking-[0.5em] font-mono text-lg"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="\d{6}"
                                    {...field}
                                />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify & Login
                    </Button>
                    </form>
                </Form>
                <Button variant="link" size="sm" className="mt-6 w-full text-muted-foreground" onClick={() => {
                    setStep('request');
                    setIdentifier('');
                }}>
                    Use a different email or number
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
