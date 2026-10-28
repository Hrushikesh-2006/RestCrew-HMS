'use client';

import { cn } from '@/lib/utils';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'teal' | 'amber' | 'none';
  hover?: boolean;
}

export function Card3D({ children, className, glowColor = 'teal', hover = true }: Card3DProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground border border-border shadow-xs rounded-2xl p-6 relative overflow-hidden',
        hover && 'card-3d cursor-pointer',
        glowColor === 'teal' && 'hover:border-teal-500/50 hover:shadow-[0_4px_20px_rgba(20,184,166,0.15)]',
        glowColor === 'amber' && 'hover:border-amber-500/50 hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Card3DFlat({ children, className, glowColor = 'teal' }: Omit<Card3DProps, 'hover'>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground border border-border shadow-xs rounded-xl p-4 relative overflow-hidden cursor-pointer',
        'card-3d-flat',
        glowColor === 'teal' && 'hover:border-teal-500/50 hover:shadow-[0_2px_12px_rgba(20,184,166,0.12)]',
        glowColor === 'amber' && 'hover:border-amber-500/50 hover:shadow-[0_2px_12px_rgba(245,158,11,0.12)]',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
