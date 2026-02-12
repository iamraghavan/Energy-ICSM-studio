import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  isIcon = false,
}: {
  className?: string;
  isIcon?: boolean;
}) {
  if (isIcon) {
    return (
      <div className={cn('relative h-6 w-6', className)}>
        <Image
          src="/Energy_college_logo.png"
          alt="Energy Sports Meet Logo"
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn('relative h-14 w-40', className)}>
      <Image
        src="/Energy_college_logo.png"
        alt="Energy Sports Meet Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}
// 05