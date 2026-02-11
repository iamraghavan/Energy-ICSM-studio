import { cn } from "@/lib/utils";

export function BauhausDecoration({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid h-6 w-6 grid-cols-2 grid-rows-2 gap-px", className)}
    >
      <div className="bg-accent" />
      <div className="relative flex items-center justify-center bg-primary">
        <div className="h-2 w-2 rounded-full bg-background" />
      </div>
      <div className="bg-destructive" />
      <div className="relative overflow-hidden bg-background">
        <div className="absolute -bottom-1 -right-2 h-4 w-4 rotate-45 bg-primary" />
      </div>
    </div>
  );
}
