'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'teal' | 'amber' | 'purple' | 'pink' | 'blue';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-slate-700 text-slate-300',
    glow: 'hover:shadow-[0_0_30px_rgba(100,116,139,0.3)]',
  },
  teal: {
    icon: 'bg-teal-500/20 text-teal-400',
    glow: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]',
  },
  amber: {
    icon: 'bg-amber-500/20 text-amber-400',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
  },
  purple: {
    icon: 'bg-purple-500/20 text-purple-400',
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  },
  pink: {
    icon: 'bg-pink-500/20 text-pink-400',
    glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]',
  },
  blue: {
    icon: 'bg-blue-500/20 text-blue-400',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'glass rounded-2xl p-6 relative overflow-hidden',
        'card-3d cursor-pointer',
        styles.glow,
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatsCardCompact({
  title,
  value,
  icon: Icon,
  variant = 'default',
}: Omit<StatsCardProps, 'subtitle' | 'trend' | 'className'>) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'glass rounded-xl p-4 flex items-center gap-3',
        'hover:shadow-lg transition-shadow cursor-pointer',
        styles.glow,
      )}
    >
      <div className={cn('p-2 rounded-lg', styles.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </motion.div>
  );
}
