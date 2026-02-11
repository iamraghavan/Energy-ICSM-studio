import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("font-headline text-3xl font-bold text-primary", className)}>
      SportZone
    </div>
  );
}
