'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Chrome,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { getFirebaseClientAuth } from '@/lib/firebase-client';
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
  const { loginOwner } = useAuthStore();

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

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_28%)]" />
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
        className="relative z-10 w-full max-w-md"
      >
          <Card className="glass card-3d overflow-hidden border-teal-500/20">
            <CardHeader className="pb-0 pt-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 shadow-lg shadow-teal-500/30"
              >
                <Building2 className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl">
                <span className="gradient-text">Owner Portal</span>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Real hostel onboarding with shared database access
              </p>
            </CardHeader>

            <CardContent className="px-5 pb-6 pt-5 lg:px-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="mb-6 grid h-11 w-full grid-cols-2 bg-slate-900/60">
                  <TabsTrigger value="login" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300">
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="owner-email"
                          type="email"
                          placeholder="owner@restcrew.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="input-dark h-11 pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="owner-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
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
                      className="h-11 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-cyan-600"
                    >
                      {isLoading ? <div className="spinner h-5 w-5" /> : 'Sign In'}
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

                  <p className="mt-4 rounded-2xl border border-teal-500/20 bg-teal-500/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
                    Owners now sign in against the shared Prisma database. Every student you add will stay linked to your hostel, even outside your browser.
                  </p>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner-name">Full Name</Label>
                      <Input
                        id="owner-name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="John Smith"
                        className="input-dark h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner-register-email">Email</Label>
                      <Input
                        id="owner-register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="owner@example.com"
                        className="input-dark h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner-register-password">Password</Label>
                      <Input
                        id="owner-register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="input-dark h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner-hostel-name">Hostel Name</Label>
                      <Input
                        id="owner-hostel-name"
                        value={hostelName}
                        onChange={(e) => setHostelName(e.target.value)}
                        placeholder="Sunrise Hostel"
                        className="input-dark h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner-hostel-address">Hostel Address</Label>
                      <Input
                        id="owner-hostel-address"
                        value={hostelAddress}
                        onChange={(e) => setHostelAddress(e.target.value)}
                        placeholder="123 Main Street, City"
                        className="input-dark h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner-phone">Phone Number</Label>
                      <Input
                        id="owner-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="input-dark h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-11 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-cyan-600"
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
