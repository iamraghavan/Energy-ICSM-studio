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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  onVerify: (registrationCode: string, status: 'approved' | 'rejected', remarks: string) => Promise<void>;
}

export function VerifyPaymentModal({
  isOpen,
  onClose,
  registration,
  onVerify,
}: VerifyPaymentModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [action, setAction] = useState<'approved' | 'rejected' | null>(null);
  const [remarks, setRemarks] = useState('');

  const handleVerify = async (status: 'approved' | 'rejected') => {
    setIsVerifying(true);
    setAction(status);
    await onVerify(registration.registration_code, status, remarks);
    setIsVerifying(false);
    setAction(null);
    setRemarks('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 h-screen w-screen max-w-full rounded-none border-0 flex flex-col top-0 left-0 translate-x-0 translate-y-0 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-bottom">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription>
            Review the payment details for {registration.Student.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid md:grid-cols-2 gap-0 overflow-hidden">
            <ScrollArea className="h-full">
                 <div className="p-6 space-y-6">
                    <InfoRow label="Registration Code" value={registration.registration_code} isMono />
                    <InfoRow label="Student Name" value={registration.Student.name} />
                    <InfoRow label="Email" value={registration.Student.email} />
                    <InfoRow label="Mobile" value={registration.Student.mobile} />
                    <InfoRow label="College" value={registration.Student.other_college} />
                    <InfoRow label="Sport" value={registration.Sport?.name} />
                    <InfoRow label="Team Name" value={registration.Team?.team_name} />
                    <InfoRow label="Transaction ID" value={registration.Payment?.txn_id} isMono />
                    <InfoRow label="Amount" value={registration.Payment?.amount ? `₹${registration.Payment.amount}` : 'N/A'} />
                 </div>
                 {registration.payment_status === 'pending' && (
                    <div className="p-6 border-t">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea 
                            id="remarks"
                            placeholder="Add remarks for approval or rejection..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                 )}
            </ScrollArea>
            <div className="bg-muted/50 flex items-center justify-center p-6 border-l overflow-auto h-full">
                 {registration.Payment?.screenshot_url ? (
                    <div className="relative w-full h-full max-w-md mx-auto">
                        <Image
                            src={registration.Payment.screenshot_url}
                            alt="Payment Screenshot"
                            fill
                            className="object-contain"
                        />
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        No screenshot provided.
                    </div>
                )}
            </div>
        </div>

        <DialogFooter className="p-4 border-t">
          {registration.payment_status === 'pending' ? (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                  variant="destructive"
                  onClick={() => handleVerify('rejected')}
                  disabled={isVerifying}
              >
                  {isVerifying && action === 'rejected' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject
              </Button>
              <Button onClick={() => handleVerify('approved')} disabled={isVerifying}>
                  {isVerifying && action === 'approved' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve
              </Button>
            </div>
          ) : (
             <Button variant="outline" onClick={onClose} className="ml-auto">Close</Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({label, value, isMono = false}: {label: string, value: string | undefined | null, isMono?: boolean}) {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("font-medium text-base", isMono && "font-mono")}>{value}</p>
        </div>
    )
}
