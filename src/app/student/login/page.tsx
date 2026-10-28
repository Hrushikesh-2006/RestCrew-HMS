'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { requestJson } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

interface StudentAuthPayload {
  id: string;
  userId?: string;
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
}

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
  const [studentUserId, setStudentUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { student } = await requestJson<{ student: StudentAuthPayload }>('/api/auth/student/login', {
        method: 'POST',
        body: JSON.stringify({
          userId: studentUserId.trim(),
          password: loginPassword,
        }),
      });

      loginStudent(student);
      toast({
        title: 'Welcome back!',
        description: student.hostelName
          ? `Connected to ${student.hostelName}`
          : `Logged in as ${student.name}`,
      });
      router.push('/student/dashboard');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid Student ID or password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasHydrated || (isAuthenticated && userType === 'student')) {
    return (
      <div className="relative grid h-[100dvh] place-items-center overflow-hidden bg-background">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background p-4 text-foreground sm:p-6 overflow-x-hidden">
      {/* Top Controls */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground font-medium p-1.5 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center max-w-md my-auto">
        <Card className="w-full overflow-hidden border border-border bg-card shadow-xl rounded-2xl sm:rounded-3xl">
          <CardHeader className="pb-0 pt-8 sm:pt-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="mx-auto mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl overflow-hidden shadow-lg"
            >
              <Image src="/logo.svg" alt="RestCrew" width={80} height={80} className="w-full h-full" />
            </motion.div>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="gradient-text-alt">Student Portal</span>
            </CardTitle>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
              Sign in with credentials provided by your hostel owner
            </p>
          </CardHeader>

          <CardContent className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="student-userid" className="text-xs sm:text-sm font-medium">
                  Student User ID
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="student-userid"
                    type="text"
                    placeholder="e.g. STU101 or student name ID"
                    value={studentUserId}
                    onChange={(e) => setStudentUserId(e.target.value)}
                    className="h-10 sm:h-11 pl-10 text-xs sm:text-sm"
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student-password" className="text-xs sm:text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="student-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter assigned password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-10 sm:h-11 pl-10 pr-10 text-xs sm:text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 sm:h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md hover:from-amber-600 hover:to-orange-600 transition-all text-xs sm:text-sm"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In To My Hostel'}
              </Button>
            </form>

            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-3.5 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Hostel Member Login:</strong> Enter the unique Student User ID and password assigned to you by your hostel owner.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
