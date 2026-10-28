'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8', className)}>
      <div className="flex items-center gap-3 sm:gap-4">
        {Icon && (
          <div className="p-2.5 sm:p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500 dark:text-teal-400" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        {action}
        <ThemeToggle />
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: Omit<PageHeaderProps, 'icon' | 'className'>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="self-start sm:self-auto">
          {action}
        </div>
      )}
    </div>
  );
}
