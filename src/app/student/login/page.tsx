'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Chrome,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { getFirebaseClientAuth } from '@/lib/firebase-client';
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
  const { loginStudent } = useAuthStore();

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
        description: student.hostelName
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, provider } = getFirebaseClientAuth();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const { student } = await requestJson<{ student: StudentAuthPayload }>('/api/auth/student/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      loginStudent(student);
      toast({
        title: 'Google Login Successful',
        description: student.hostelName ? `Connected to ${student.hostelName}` : `Logged in as ${student.name}`,
      });
      router.push('/student/dashboard');
    } catch (error) {
      toast({
        title: 'Google Login Failed',
        description: error instanceof Error ? error.message : 'Unable to continue with Google.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.15),transparent_28%)]" />
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        className="absolute top-10 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/20 to-transparent blur-3xl"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-gradient-to-br from-teal-500/20 to-transparent blur-3xl"
      />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 text-muted-foreground transition-colors hover:text-amber-300"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
          <Card className="glass card-3d overflow-hidden border-amber-500/20">
            <CardHeader className="pb-0 pt-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 shadow-lg shadow-amber-500/30"
              >
                <User2 className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl">
                <span className="gradient-text-alt">Student Portal</span>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in with the details your hostel owner created for you
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
                  className="h-11 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600"
                >
                  {isLoading ? <div className="spinner h-5 w-5" /> : 'Sign In To My Hostel'}
                </Button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="h-11 w-full border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-muted-foreground">
                Student accounts are now owner-managed. If you do not have credentials yet, ask your hostel owner to add you from the owner dashboard first.
              </div>
            </CardContent>
          </Card>
      </motion.div>
    </div>
  );
}
