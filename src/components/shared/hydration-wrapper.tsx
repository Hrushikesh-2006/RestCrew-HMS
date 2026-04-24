'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

interface HydrationWrapperProps {
  children: React.ReactNode;
}

export function HydrationWrapper({ children }: HydrationWrapperProps) {
  const { hasHydrated, setHasHydrated } = useAuthStore();

  useEffect(() => {
    // Ensure hydration is marked as complete
    if (!hasHydrated) {
      setHasHydrated(true);
    }
  }, [hasHydrated, setHasHydrated]);

  // Only render children after hydration is complete
  if (!hasHydrated) {
    return (
      <div className="h-screen relative overflow-hidden flex items-center justify-center bg-[#020617]">
        <div className="absolute inset-0 hero-pattern opacity-40" />
        <div className="relative z-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
          <p className="mt-4 text-purple-400">Loading RestCrew...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}