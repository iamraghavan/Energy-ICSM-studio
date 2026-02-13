'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/api';
import { Logo } from '@/components/shared/logo';
import { Loader2 } from 'lucide-react';
import { getUserSession, type UserSession } from '@/lib/auth';

const getDashboardPathForRole = (role: UserSession['role']): string => {
    switch (role) {
        case 'super_admin':
            return '/admin/dashboard';
        case 'sports_head':
            return '/sports-head/dashboard';
        case 'scorer':
            return '/scorer/dashboard';
        case 'committee':
            return '/committee/dashboard';
        default:
            return '/auth/session'; // Fallback
    }
}

export default function AuthSessionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      router.replace(getDashboardPathForRole(session.role));
    } else {
      setIsCheckingSession(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await loginUser({ username: email, password });
      const token = response.token;
      const role = response.role;

      if (token && role) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_role', role);
        if (response.assigned_sport_id) {
          localStorage.setItem('assigned_sport_id', String(response.assigned_sport_id));
        } else {
          localStorage.removeItem('assigned_sport_id');
        }
        router.replace(getDashboardPathForRole(role as UserSession['role']));
      } else {
        throw new Error("Login failed: No token or role received.");
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.response?.data?.message || 'Invalid credentials. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto">
                <Logo />
            </div>
            <CardTitle className="font-headline text-2xl mt-4">Console Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
