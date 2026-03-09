'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Open' | 'Pending' | 'Resolved' | 'Paid' | 'Overdue' | 'Vacant' | 'Occupied' | 'Full' | string;
  className?: string;
  animated?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Open: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  Pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  Resolved: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
  Paid: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
  Overdue: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  Vacant: { bg: 'bg-teal-500/20', text: 'text-teal-400', dot: 'bg-teal-400' },
  Occupied: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  Full: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  default: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
};

export function StatusBadge({ status, className, animated = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.default;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          config.dot,
          animated && 'status-pulse'
        )}
      />
      {status}
    </span>
  );
}

export function FeeStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function ComplaintStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export function RoomStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}
