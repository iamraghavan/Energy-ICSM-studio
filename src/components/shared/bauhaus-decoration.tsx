import { cn } from "@/lib/utils";

export function BauhausDecoration({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative h-6 w-6 overflow-hidden", className)}
    >
      <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-primary opacity-50" />
      <div className="absolute -bottom-2 -right-2 h-6 w-6 rotate-45 bg-accent opacity-50" />
    </div>
  );
}
