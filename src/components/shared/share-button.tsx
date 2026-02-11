'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps extends React.ComponentProps<typeof Button> {
    url: string;
    title: string;
    text: string;
}

export function ShareButton({ url, title, text, className, ...props }: ShareButtonProps) {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const canShare = isClient && !!navigator.share;

    const handleShare = async () => {
        if (canShare) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url,
                });
            } catch (error) {
                // Don't show an error if user cancels share.
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        } else {
            // Fallback to copy to clipboard
            if (!url) return;
            try {
                await navigator.clipboard.writeText(url);
                toast({
                    title: 'Link Copied!',
                    description: 'The registration link has been copied to your clipboard.',
                });
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                toast({
                    variant: 'destructive',
                    title: 'Copy Failed',
                    description: 'Could not copy the link to your clipboard.',
                });
            }
        }
    };
    
    if (!isClient) {
        // Render a disabled button on SSR to prevent layout shift
        return (
            <Button variant="outline" className={cn("w-full", className)} disabled {...props}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
            </Button>
        );
    }

    return (
        <Button variant="outline" className={cn("w-full", className)} onClick={handleShare} {...props}>
            {canShare ? <Share2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {canShare ? 'Share Link' : 'Copy Link'}
        </Button>
    );
}
