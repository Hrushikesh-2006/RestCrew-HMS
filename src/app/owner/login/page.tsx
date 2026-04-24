'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Chrome,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { getFirebaseClientAuth } from '@/lib/firebase-client';
import { HostelModernBackground } from '@/components/shared/hostel-modern-bg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type OwnerAuthPayload = {
  id: string;
  email: string;
  name: string;
  hostelName: string;
  hostelAddress: string;
  phone?: string;
};

export default function OwnerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginOwner, isAuthenticated, userType, hasHydrated } = useAuthStore();
  
  useEffect(() => {
    if (hasHydrated && isAuthenticated && userType === 'owner') {
      router.push('/owner/dashboard');
    }
  }, [hasHydrated, isAuthenticated, userType, router]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [hostelAddress, setHostelAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { owner } = await requestJson<{ owner: OwnerAuthPayload }>('/api/auth/owner/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      loginOwner(owner);
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${owner.name}`,
      });
      router.push('/owner/dashboard');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { owner } = await requestJson<{ owner: OwnerAuthPayload }>('/api/auth/owner/register', {
        method: 'POST',
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          hostelName,
          hostelAddress,
          phone,
        }),
      });

      loginOwner(owner);
      toast({
        title: 'Registration Successful!',
        description: `${owner.hostelName} is ready for student onboarding.`,
      });
      router.push('/owner/dashboard');
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Unable to create owner account.',
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

      const { owner } = await requestJson<{ owner: OwnerAuthPayload }>('/api/auth/owner/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      loginOwner(owner);
      toast({
        title: 'Google Login Successful',
        description: `Welcome ${owner.name}`,
      });
      router.push('/owner/dashboard');
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

  if (!hasHydrated || (isAuthenticated && userType === 'owner')) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#020617]">
        <div className="absolute inset-0 hero-pattern opacity-40" />
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] text-white flex items-center justify-center p-4">
      <HostelModernBackground />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.08),transparent_40%)]" />
      <motion.div
        animate={{ y: [-12, 12, -12], rotate: [-2, 2, -2] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        className="absolute left-8 top-10 h-36 w-36 rounded-full bg-gradient-to-br from-teal-500/20 to-transparent blur-3xl"
      />
      <motion.div
        animate={{ y: [12, -12, 12], rotate: [2, -2, 2] }}
        transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
        className="absolute bottom-10 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl"
      />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 text-muted-foreground transition-colors hover:text-teal-300"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[360px] max-h-[95vh] flex flex-col"
      >
          <Card className="glass card-3d flex flex-col overflow-hidden border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
            <CardHeader className="pb-0 pt-5 text-center shrink-0">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-xl shadow-purple-500/20"
              >
                <Building2 className="h-6 w-6 text-white" />
              </motion.div>
              <CardTitle className="text-xl font-bold tracking-tight mb-1">
                <span className="gradient-text">Owner Portal</span>
              </CardTitle>
              <p className="text-xs text-slate-400 font-medium pb-2">
                Manage your hostel with RestCrew
              </p>
            </CardHeader>

            <CardContent className="px-5 pb-5 pt-3 overflow-y-auto flex-1 hide-scrollbar">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="mb-4 grid h-9 w-full grid-cols-2 bg-slate-900/60 rounded-md">
                  <TabsTrigger value="login" className="text-xs data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-xs data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300">
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="owner-email" className="text-xs">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="owner-email"
                          type="email"
                          placeholder="owner@restcrew.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="input-dark h-9 pl-9 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="owner-password" className="text-xs">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="owner-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="input-dark h-9 pl-9 pr-9 text-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-9 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-cyan-600 text-xs font-medium mt-2"
                    >
                      {isLoading ? <div className="spinner h-4 w-4" /> : 'Sign In'}
                    </Button>
                  </form>

                  <div className="my-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="h-9 w-full border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                  >
                    <Chrome className="mr-2 h-3.5 w-3.5" />
                    Continue with Google
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="owner-name" className="text-xs">Full Name</Label>
                      <Input
                        id="owner-name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="John Smith"
                        className="input-dark h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="owner-register-email" className="text-xs">Email</Label>
                      <Input
                        id="owner-register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="owner@example.com"
                        className="input-dark h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="owner-register-password" className="text-xs">Password</Label>
                      <Input
                        id="owner-register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="input-dark h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="owner-hostel-name" className="text-xs">Hostel Name</Label>
                      <Input
                        id="owner-hostel-name"
                        value={hostelName}
                        onChange={(e) => setHostelName(e.target.value)}
                        placeholder="Sunrise Hostel"
                        className="input-dark h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="owner-hostel-address" className="text-xs">Hostel Address</Label>
                      <Input
                        id="owner-hostel-address"
                        value={hostelAddress}
                        onChange={(e) => setHostelAddress(e.target.value)}
                        placeholder="123 Main St"
                        className="input-dark h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="owner-phone" className="text-xs">Phone Number</Label>
                      <Input
                        id="owner-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="input-dark h-9 text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-9 mt-2 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-cyan-600 text-xs font-medium"
                    >
                      {isLoading ? <div className="spinner h-5 w-5" /> : 'Create Owner Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
      </motion.div>
    </div>
  );
}
