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

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Please enter your email or WhatsApp number." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function StudentAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
    },
  });
  
  const action = searchParams.get('action') || 'login';

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    // This is a placeholder for the actual login logic.
    // In a real application, you would call an API endpoint here.
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Login Attempted',
      description: `We're checking for an account with: ${data.identifier}`,
    });
    
    // For now, let's just show a success toast.
    // A real implementation would involve OTP or password verification.
    toast({
      title: 'Check your device!',
      description: 'If an account exists, you will receive login instructions.',
    });
    
    // In a real app, you might redirect to an OTP page.
    // router.push(`/energy/2026/auth/verify?identifier=${data.identifier}`);

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto">
                <Logo />
            </div>
            <CardTitle className="font-headline text-2xl mt-4 capitalize">{action} to Your Account</CardTitle>
            <CardDescription>Enter the email or WhatsApp number you used during registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                Continue
              </Button>
            </form>
          </Form>
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
