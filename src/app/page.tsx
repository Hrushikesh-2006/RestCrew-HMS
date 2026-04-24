'use client';

import { Building2, User2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { HostelModernBackground } from '@/components/shared/hostel-modern-bg';

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
      <div className="h-screen relative overflow-hidden flex items-center justify-center bg-[#020617]">
        <div className="absolute inset-0 hero-pattern opacity-40" />
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      {/* HostelModernBackground disabled for pure black theme */}
      
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 lg:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-3xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen Hostel Management</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 mt-2">
            Welcome to <span className="gradient-text drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">RestCrew</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Experience the future of shared living. Seamlessly manage your hostel or stay updated with your stay in real-time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl relative">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push('/owner/login');
            }}
            onClick={() => router.push('/owner/login')}
          >
            <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative glass p-10 rounded-3xl flex flex-col h-full cursor-pointer overflow-hidden border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Building2 className="h-32 w-32" />
              </div>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                <Building2 className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white">Hostel Owner</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Streamline operations, manage fees, room allocation, and analytics in one powerful dashboard.
              </p>
              <div className="mt-auto flex items-center gap-2 text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                Enter Owner Portal <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push('/student/login');
            }}
            onClick={() => router.push('/student/login')}
          >
            <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative glass p-10 rounded-3xl flex flex-col h-full cursor-pointer overflow-hidden border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <User2 className="h-32 w-32" />
              </div>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400">
                <User2 className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white">Guest Student</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Pay fees, track meals, report issues, and stay connected with your hostel management.
              </p>
              <div className="mt-auto flex items-center gap-2 text-cyan-400 font-semibold group-hover:text-cyan-300 transition-colors">
                Enter Student Portal <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
