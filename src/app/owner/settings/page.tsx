'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Download,
  Info,
  LogOut,
  Settings,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  Edit,
} from 'lucide-react';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function OwnerSettingsPage() {
  const router = useRouter();
  const { owner, isAuthenticated, userType, logout, updateOwner } = useAuthStore();
  const { clearAllData, updateOwnerData } = useDataStore();
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [editName, setEditName] = useState('');
  const [editHostelName, setEditHostelName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    if (owner) {
      setEditName(owner.name);
      setEditHostelName(owner.hostelName);
      setEditPhone(owner.phone || '');
    }
  }, [owner]);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [isAuthenticated, router, userType]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installSteps = useMemo(
    () => [
      'Android: open the site in Chrome, then tap Install App when it appears.',
      'If Chrome does not show the prompt, open the browser menu and tap Add to Home screen.',
      'iPhone: open the site in Safari, tap Share, then choose Add to Home Screen.',
    ],
    []
  );

  if (!owner) {
    return null;
  }

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    setIsInstalling(true);
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
    setIsInstalling(false);
  };

  const handleResetDeviceData = () => {
    const confirmed = window.confirm(
      'This clears saved RestCrew data from this device browser only. Continue?'
    );

    if (!confirmed) {
      return;
    }

    clearAllData();
    logout();
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner) return;

    try {
      const response = await fetch('/api/owner/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: owner.id,
          name: editName,
          hostelName: editHostelName,
          phone: editPhone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const { owner: updatedOwner } = await response.json();

      updateOwner(updatedOwner);

      // Also update local data store for consistency
      updateOwnerData(owner.email, {
        name: editName,
        hostelName: editHostelName,
        phone: editPhone,
      });

      setIsEditDialogOpen(false);
      toast({
        title: 'Profile Updated',
        description: 'Your hostel profile has been updated successfully in the database.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Unable to save changes.',
        variant: 'destructive',
      });
    }
  };

  return (
    <OwnerLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="gradient-text text-3xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your owner profile, device install, and local browser data.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-emerald-500/30 text-emerald-300">
            Deployment-ready
          </Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRound className="h-5 w-5 text-cyan-300" />
                Owner Profile
              </CardTitle>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 border border-white/10 hover:bg-white/5">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-white/10 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">Edit Owner Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostelName">Hostel Name</Label>
                      <Input
                        id="hostelName"
                        value={editHostelName}
                        onChange={(e) => setEditHostelName(e.target.value)}
                        className="input-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="input-dark"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600">
                      Save Changes
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</p>
                <p className="mt-2 text-base font-semibold">{owner.name}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                <p className="mt-2 text-base font-semibold break-all">{owner.email}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hostel</p>
                <p className="mt-2 text-base font-semibold">{owner.hostelName}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
                <p className="mt-2 text-base font-semibold">{owner.phone || 'Not added yet'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5 text-emerald-300" />
                Mobile Install
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-muted-foreground">
                This deployment now exposes the manifest and service worker needed to install RestCrew on supported mobile browsers.
              </div>
              <Button
                onClick={handleInstall}
                disabled={!installPrompt || isInstalling}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600"
              >
                <Download className="mr-2 h-4 w-4" />
                {installPrompt ? 'Install App' : 'Install Prompt Not Available Yet'}
              </Button>
              <div className="space-y-3">
                {installSteps.map((step) => (
                  <div key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                Session Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout From This Device
              </Button>
              <p className="text-sm text-muted-foreground">
                Your sign-in is stored on this browser. Logging out removes the active owner session.
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-red-300">
                <Settings className="h-5 w-5" />
                Device Data Reset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="destructive"
                onClick={handleResetDeviceData}
                className="w-full justify-start"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Browser Data For RestCrew
              </Button>
              <p className="text-sm text-muted-foreground">
                This only clears the local RestCrew data saved in the current browser or installed app on this device.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </OwnerLayout>
  );
}
