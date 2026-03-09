'use client';

import { motion, Variants } from 'framer-motion';
import { Building2, User2, ArrowRight, Shield, Users, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  };

  const floatVariants: Variants = {
    animate: {
      y: [-15, 15, -15],
      rotate: [-2, 2, -2],
      transition: { duration: 8, ease: 'easeInOut', repeat: Infinity },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 hero-pattern" />
      
      {/* Floating Orbs with different colors */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute top-10 left-5 w-40 h-40 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-purple-500/25 via-pink-500/15 to-transparent blur-3xl"
      />
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
        className="absolute bottom-10 right-5 w-48 h-48 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-transparent blur-3xl"
      />
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{ animationDelay: '4s' }}
        className="absolute top-1/2 left-1/3 w-32 h-32 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-cyan-500/20 via-teal-500/15 to-transparent blur-3xl"
      />
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{ animationDelay: '6s' }}
        className="absolute top-20 right-1/4 w-24 h-24 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-transparent blur-3xl"
      />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8"
      >
        {/* Logo and Title */}
        <motion.div variants={itemVariants} className="text-center mb-6 lg:mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative inline-flex"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl lg:rounded-3xl blur-xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl">
              <Building2 className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 lg:mt-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">
              <span className="gradient-text">Rest</span>
              <span className="gradient-text-alt">Crew</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-3 lg:mt-4 h-1 w-32 lg:w-48 mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
            />
          </motion.div>
          
          <p className="text-base lg:text-xl text-muted-foreground max-w-md mx-auto px-4 mt-4 lg:mt-6">
            Modern Hostel Management System for Owners and Students
          </p>
        </motion.div>

        {/* Features */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-8 lg:mb-12">
          {[
            { icon: Shield, text: 'Secure', color: 'from-green-400 to-emerald-500' },
            { icon: Users, text: 'Collaborative', color: 'from-blue-400 to-cyan-500' },
            { icon: Sparkles, text: 'Beautiful', color: 'from-purple-400 to-pink-500' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-full glass hover:border-purple-500/30 transition-all cursor-default"
            >
              <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                <feature.icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Login Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full max-w-4xl"
        >
          {/* Owner Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/owner/login')}
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl glass p-6 lg:p-8 text-left transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border border-purple-500/0 group-hover:border-purple-500/30 transition-colors duration-500" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 lg:w-18 lg:h-18 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 flex items-center justify-center mb-4 lg:mb-6 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-500">
                <Building2 className="w-7 h-7 lg:w-9 lg:h-9 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                Hostel Owner
              </h2>
              <p className="text-muted-foreground text-sm lg:text-base mb-4 lg:mb-6 leading-relaxed">
                Manage rooms, students, fees, and track your hostel's performance with powerful analytics.
              </p>
              <div className="flex items-center gap-2 text-purple-400 group-hover:gap-4 transition-all duration-300">
                <span className="font-medium text-sm lg:text-base">Access Owner Portal</span>
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </motion.button>

          {/* Student Card */}
          <motion.button
            whileHover={{ scale: 1.02, y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/student/login')}
            className="group relative overflow-hidden rounded-2xl lg:rounded-3xl glass p-6 lg:p-8 text-left transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border border-orange-500/0 group-hover:border-orange-500/30 transition-colors duration-500" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 lg:w-18 lg:h-18 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center mb-4 lg:mb-6 shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-500">
                <User2 className="w-7 h-7 lg:w-9 lg:h-9 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                Student / Hosteler
              </h2>
              <p className="text-muted-foreground text-sm lg:text-base mb-4 lg:mb-6 leading-relaxed">
                Access meals, submit complaints, check fees, and manage your hostel services easily.
              </p>
              <div className="flex items-center gap-2 text-orange-400 group-hover:gap-4 transition-all duration-300">
                <span className="font-medium text-sm lg:text-base">Access Student Portal</span>
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 lg:mt-16 text-center"
        >
          <p className="text-xs lg:text-sm text-muted-foreground">
            © 2024 RestCrew. Modern Hostel Management.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
