'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'spinner border-t-teal-400',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-1/3 mb-4" />
      <div className="h-8 bg-slate-700 rounded w-2/3 mb-2" />
      <div className="h-3 bg-slate-700 rounded w-1/2" />
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-700 rounded flex-1 animate-pulse" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-border last:border-0">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-700 rounded flex-1 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
