'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

let deferredPrompt: any = null;

export function PwaInstallButton() {
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser from showing the default install prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Optionally listen to appinstalled event to hide the button
    const handleAppInstalled = () => {
      setIsInstallable(false);
      deferredPrompt = null;
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setIsInstallable(false);
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }
    
    deferredPrompt = null;
  };

  if (!isInstallable) return null;

  return (
    <Button
      onClick={handleInstallClick}
      variant="default"
      className="fixed bottom-4 right-4 z-50 shadow-2xl flex items-center gap-2 rounded-full px-4 py-6"
    >
      <Download className="h-5 w-5" />
      <span>Install App</span>
    </Button>
  );
}
