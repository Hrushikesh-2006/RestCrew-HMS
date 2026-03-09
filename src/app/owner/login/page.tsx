'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, ArrowLeft, Eye, EyeOff, Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function OwnerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginOwner } = useAuthStore();
  const { owners, addOwner } = useDataStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [hostelAddress, setHostelAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const owner = owners.find(o => o.email === loginEmail && o.password === loginPassword);
    
    if (owner) {
      loginOwner({
        id: owner.id,
        email: owner.email,
        name: owner.name,
        hostelName: owner.hostelName,
        hostelAddress: owner.hostelAddress,
        phone: owner.phone,
      });
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${owner.name}`,
      });
      router.push('/owner/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please register first.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, create a new owner with Google email
    const googleEmail = 'google.owner@gmail.com';
    const existingOwner = owners.find(o => o.email === googleEmail);
    
    if (existingOwner) {
      loginOwner({
        id: existingOwner.id,
        email: existingOwner.email,
        name: existingOwner.name,
        hostelName: existingOwner.hostelName,
        hostelAddress: existingOwner.hostelAddress,
        phone: existingOwner.phone,
      });
    } else {
      const newOwner = {
        id: `owner_${Date.now()}`,
        email: googleEmail,
        password: 'google_oauth',
        name: 'Google User',
        hostelName: 'New Hostel',
        hostelAddress: 'Please update your address',
        phone: '',
      };
      addOwner(newOwner);
      loginOwner({
        id: newOwner.id,
        email: newOwner.email,
        name: newOwner.name,
        hostelName: newOwner.hostelName,
        hostelAddress: newOwner.hostelAddress,
        phone: newOwner.phone,
      });
    }
    
    toast({
      title: 'Google Login Successful!',
      description: 'Welcome to RestCrew',
    });
    router.push('/owner/dashboard');
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (owners.find(o => o.email === registerEmail)) {
      toast({
        title: 'Registration Failed',
        description: 'Email already exists',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    const newOwner = {
      id: `owner_${Date.now()}`,
      email: registerEmail,
      password: registerPassword,
      name: registerName,
      hostelName,
      hostelAddress,
      phone,
    };
    
    addOwner(newOwner);
    loginOwner({
      id: newOwner.id,
      email: newOwner.email,
      name: newOwner.name,
      hostelName: newOwner.hostelName,
      hostelAddress: newOwner.hostelAddress,
      phone: newOwner.phone,
    });
    
    toast({
      title: 'Registration Successful!',
      description: 'Welcome to RestCrew',
    });
    router.push('/owner/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 hero-pattern" />
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        className="absolute top-10 left-10 w-32 h-32 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-teal-500/20 to-transparent blur-3xl"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        className="absolute bottom-10 right-10 w-48 h-48 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-amber-500/20 to-transparent blur-3xl"
      />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 lg:top-6 lg:left-6 flex items-center gap-2 text-muted-foreground hover:text-teal-400 transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
        <span className="text-sm lg:text-base">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="glass border-teal-500/20 overflow-hidden">
          {/* Header */}
          <CardHeader className="text-center pb-0 pt-6 lg:pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mx-auto w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4"
            >
              <Building2 className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
            </motion.div>
            <CardTitle className="text-xl lg:text-2xl">
              <span className="gradient-text">Owner Portal</span>
            </CardTitle>
            <p className="text-muted-foreground text-xs lg:text-sm mt-1">
              Manage your hostel efficiently
            </p>
          </CardHeader>

          <CardContent className="pt-4 px-4 lg:px-6 pb-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 lg:mb-6 bg-slate-800/50 h-10 lg:h-11">
                <TabsTrigger value="login" className="text-xs lg:text-sm data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="text-xs lg:text-sm data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3 lg:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="owner@restcrew.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-9 lg:pl-10 input-dark h-10 lg:h-11"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-9 lg:pl-10 pr-10 input-dark h-10 lg:h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium h-11 lg:h-12 btn-hover-lift"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 spinner" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="relative my-4 lg:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full border-teal-500/30 hover:bg-teal-500/10 hover:border-teal-500/50 h-11 lg:h-12"
                >
                  <Chrome className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                  Sign in with Google
                </Button>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-3 lg:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-sm">Full Name</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="John Smith"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="input-dark h-10 lg:h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-sm">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="owner@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="input-dark h-10 lg:h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-sm">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="input-dark h-10 lg:h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hostel-name" className="text-sm">Hostel Name</Label>
                    <Input
                      id="hostel-name"
                      type="text"
                      placeholder="Sunrise Hostel"
                      value={hostelName}
                      onChange={(e) => setHostelName(e.target.value)}
                      className="input-dark h-10 lg:h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hostel-address" className="text-sm">Hostel Address</Label>
                    <Input
                      id="hostel-address"
                      type="text"
                      placeholder="123 Main Street, City"
                      value={hostelAddress}
                      onChange={(e) => setHostelAddress(e.target.value)}
                      className="input-dark h-10 lg:h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-dark h-10 lg:h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium h-11 lg:h-12 btn-hover-lift"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 spinner" />
                    ) : (
                      'Create Account'
                    )}
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
