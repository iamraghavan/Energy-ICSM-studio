'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Zap } from 'lucide-react';

function PayContent() {
    const searchParams = useSearchParams();
    const amount = searchParams.get('amount') || '0';
    const payee = "EGSPILLAYENGG@dbs";
    const name = "Energy 2026";
    
    // Construct the standard UPI Deep Link
    const upiLink = `upi://pay?pa=${payee}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(name)}`;

    useEffect(() => {
        // Automatically attempt deep link trigger on mount
        const timer = setTimeout(() => {
            window.location.href = upiLink;
        }, 800);
        return () => clearTimeout(timer);
    }, [upiLink]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30 font-sans selection:bg-primary/10">
            <div className="w-full max-w-sm text-center space-y-8 p-8 bg-background rounded-[2.5rem] border shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <Logo className="h-12 w-32" />
                </div>
                
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full mb-2">
                        <Zap className="h-3 w-3 animate-pulse fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Instant Gateway</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter italic">Connecting UPI</h1>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide px-4">
                        Please wait while we link to your preferred payment application.
                    </p>
                </div>

                <div className="py-12 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-40 w-40 rounded-full border-4 border-primary/5 border-t-primary animate-spin" />
                    </div>
                    <CreditCard className="h-14 w-14 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                    <div className="mt-24">
                        <p className="text-5xl font-black tabular-nums tracking-tighter text-slate-900">
                            <span className="text-2xl text-slate-400 mr-1">₹</span>{amount}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Button 
                        size="lg" 
                        className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
                        onClick={() => window.location.href = upiLink}
                    >
                        Launch Payment App
                    </Button>
                    
                    <p className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-400 px-6">
                        If not redirected within 3 seconds, tap the button above to proceed manually.
                    </p>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-4 opacity-40 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-4" />
                </div>
            </div>
            
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                Official Secure Payment Engine • Energy 2026
            </p>
        </div>
    );
}

export default function PayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Syncing Gateway</span>
            </div>
        }>
            <PayContent />
        </Suspense>
    );
}
