'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Registration } from '@/lib/api';
import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  onVerify: (id: string, status: 'verified' | 'rejected') => Promise<void>;
}

export function VerifyPaymentModal({
  isOpen,
  onClose,
  registration,
  onVerify,
}: VerifyPaymentModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [action, setAction] = useState<'verified' | 'rejected' | null>(null);

  const handleVerify = async (status: 'verified' | 'rejected') => {
    setIsVerifying(true);
    setAction(status);
    await onVerify(registration.id, status);
    setIsVerifying(false);
    setAction(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription>
            Review the payment details for {registration.Student.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Student:</span>
            <span className="font-medium">{registration.Student.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-mono text-sm">{registration.Payment?.txn_id}</span>
          </div>
          <div className="space-y-2">
             <span className="text-sm text-muted-foreground">Screenshot:</span>
              {registration.Payment?.screenshot_url ? (
                <div className="relative mt-2 aspect-[9/16] w-full max-w-sm mx-auto rounded-lg border overflow-hidden bg-muted">
                    <Image
                        src={registration.Payment.screenshot_url}
                        alt="Payment Screenshot"
                        fill
                        className="object-contain"
                    />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4 border rounded-md bg-muted/50">
                    No screenshot provided.
                </div>
              )}
          </div>
        </div>
        <DialogFooter>
          {registration.payment_status === 'pending' && (
            <>
            <Button
                variant="destructive"
                onClick={() => handleVerify('rejected')}
                disabled={isVerifying}
            >
                {isVerifying && action === 'rejected' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
            </Button>
            <Button onClick={() => handleVerify('verified')} disabled={isVerifying}>
                {isVerifying && action === 'verified' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
            </Button>
            </>
          )}
           {registration.payment_status !== 'pending' && (
             <Button variant="outline" onClick={onClose}>Close</Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
