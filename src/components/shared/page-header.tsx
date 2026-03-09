'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-center justify-between mb-8', className)}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20">
            <Icon className="w-6 h-6 text-teal-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

export function SectionHeader({ title, subtitle, action }: Omit<PageHeaderProps, 'icon' | 'className'>) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
