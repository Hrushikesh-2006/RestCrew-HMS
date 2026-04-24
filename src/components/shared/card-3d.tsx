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
        'glass rounded-2xl p-6 relative overflow-hidden',
        hover && 'card-3d cursor-pointer',
        glowColor === 'teal' && 'hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]',
        glowColor === 'amber' && 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
        className
      )}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 shimmer pointer-events-none" />

      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/20 via-transparent to-amber-500/20" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Card3DFlat({ children, className, glowColor = 'teal' }: Omit<Card3DProps, 'hover'>) {
  return (
    <div
      className={cn(
        'glass rounded-xl p-4 relative overflow-hidden cursor-pointer',
        'card-3d-flat',
        glowColor === 'teal' && 'hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]',
        glowColor === 'amber' && 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
