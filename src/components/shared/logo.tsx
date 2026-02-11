import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("font-headline text-2xl font-bold text-primary", className)}>
      CM TROPHY
    </div>
  );
}
