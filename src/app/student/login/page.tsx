'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User2,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { HostelModernBackground } from '@/components/shared/hostel-modern-bg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type StudentAuthPayload = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  college?: string;
  parentContact?: string;
  address?: string;
  roomId?: string;
  roomNumber?: string;
  ownerId?: string;
  hostelName?: string;
};

export default function StudentLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginStudent, isAuthenticated, userType, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && isAuthenticated && userType === 'student') {
      router.push('/student/dashboard');
    }
  }, [hasHydrated, isAuthenticated, userType, router]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { student } = await requestJson<{ student: StudentAuthPayload }>('/api/auth/student/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      loginStudent(student);
      toast({
        title: 'Welcome back!',
        description: student.hostelName ?? undefined
          ? `Connected to ${student.hostelName}`
          : `Logged in as ${student.name}`,
      });
      router.push('/student/dashboard');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Unable to sign in.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasHydrated || (isAuthenticated && userType === 'student')) {
    return (
      <div className="relative grid h-[100dvh] place-items-center overflow-hidden bg-[#020617]">
        <div className="absolute inset-0 hero-pattern opacity-40" />
        <Loader2 className="h-12 w-12 text-orange-500 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="relative grid h-[100dvh] place-items-center overflow-hidden bg-[#020617] p-4 text-white sm:p-6">
      <HostelModernBackground />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.08),transparent_40%)]" />
      <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-linear-to-br from-amber-500/20 to-transparent blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-linear-to-br from-teal-500/20 to-transparent blur-3xl animate-pulse" />

      <button
        onClick={() => router.push('/')}
        className="absolute left-4 top-4 z-20 flex items-center gap-2 text-muted-foreground transition-colors hover:text-amber-300"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="relative z-10 flex w-full items-center justify-center">
          <Card className="card-3d w-full max-w-md overflow-hidden border-white/10 bg-slate-950/95 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-none">
            <CardHeader className="pb-0 pt-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl shadow-orange-500/20"
              >
                <User2 className="h-10 w-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                <span className="gradient-text-alt">Student Portal</span>
              </CardTitle>
              <p className="mt-2 text-sm text-slate-400 font-medium">
                Enter your hostel-assigned credentials
              </p>
            </CardHeader>

            <CardContent className="px-5 pb-6 pt-5 lg:px-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="student@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="input-dark h-11 pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="student-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter assigned password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="input-dark h-11 pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600"
                >
                  {isLoading ? <div className="spinner h-5 w-5" /> : 'Sign In To My Hostel'}
                </Button>
              </form>

              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-slate-900 p-4 text-xs leading-5 text-muted-foreground">
                Student accounts are owner-managed. Sign in with the credentials provided by your hostel owner.
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
