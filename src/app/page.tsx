'use client';

import { User2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userType } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      if (userType === 'owner') {
        router.push('/owner/dashboard');
      } else if (userType === 'student') {
        router.push('/student/dashboard');
      }
    }
  }, [isAuthenticated, userType, router]);

  if (isAuthenticated) {
    return (
      <div className="h-screen relative overflow-hidden flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="w-full flex items-center justify-between px-4 sm:px-8 py-4 border-b border-border bg-card/90">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="RestCrew" width={32} height={32} className="rounded-xl" />
          <span className="font-bold text-lg gradient-text">RestCrew</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:py-16 max-w-6xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14 max-w-3xl w-full"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Hostel Management</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Welcome to <span className="gradient-text">RestCrew</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
            The modern, unified hostel management system. Effortlessly manage rooms, meals, fees, and complaints from any mobile phone or computer.
          </p>
        </motion.div>

        {/* Portal Selection Cards - Solid, no glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 w-full max-w-4xl">
          {/* Owner Portal */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push('/owner/login');
            }}
            onClick={() => router.push('/owner/login')}
          >
            <div className="bg-card text-card-foreground border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col h-full cursor-pointer shadow-md hover:shadow-xl hover:border-purple-500/40 transition-all">
              <div className="mb-5 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl overflow-hidden border border-purple-500/20">
                <Image src="/logo.svg" alt="RestCrew" width={56} height={56} className="w-full h-full" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Hostel Owner</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed flex-1">
                Streamline operations, manage fees, room assignments, meals schedule, and financial analytics from an intuitive control center.
              </p>
              <div className="mt-auto flex items-center gap-2 text-purple-500 dark:text-purple-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Enter Owner Portal</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>

          {/* Student Portal */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push('/student/login');
            }}
            onClick={() => router.push('/student/login')}
          >
            <div className="bg-card text-card-foreground border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col h-full cursor-pointer shadow-md hover:shadow-xl hover:border-teal-500/40 transition-all">
              <div className="mb-5 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <User2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Resident Student</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed flex-1">
                View fee status, track daily breakfast/lunch/dinner menus, raise maintenance complaints, and stay up to date with notices.
              </p>
              <div className="mt-auto flex items-center gap-2 text-teal-500 dark:text-teal-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Enter Student Portal</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-border text-xs text-muted-foreground">
        RestCrew Hostel Management System &bull; Designed for Mobile and Desktop
      </footer>
    </div>
  );
}
