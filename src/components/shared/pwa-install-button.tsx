'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function PwaInstallButton() {
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if already running as installed PWA (standalone)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Capture install prompt event for Chrome/Edge/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setVisible(false);
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show the small bottom install option on website load
    const enterTimeout = setTimeout(() => {
      setVisible(true);

      // Auto-vanish after 3.5 seconds after appearing
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 3500);
    }, 400);

    return () => {
      clearTimeout(enterTimeout);
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // If deferredPrompt is available (Chrome, Edge, Android)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setVisible(false);
        }
      } catch (err) {
        console.error('Error triggering PWA install:', err);
      }
      deferredPrompt = null;
      return;
    }

    // Check if iOS device
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    if (isIos) {
      setShowIosGuide(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Fallback for browsers that already have install option in address bar or menu
    alert('To install RestCrew on your device, click the install icon in your browser address bar or menu, then select "Install app".');
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  if (installed || !visible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Install App"
      onMouseEnter={() => {
        // Pause timer if user hovers
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-3 max-w-[94vw] w-auto"
    >
      <div className="bg-slate-900 dark:bg-zinc-900 text-white rounded-full px-3.5 py-2 shadow-2xl border border-slate-700/80 dark:border-zinc-700 flex items-center gap-2.5 text-xs sm:text-sm">
        <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
          <Smartphone className="w-3.5 h-3.5" />
        </div>

        <span className="font-medium whitespace-nowrap text-slate-200">
          Install RestCrew App
        </span>

        <button
          onClick={handleInstallClick}
          className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-full transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {showIosGuide && (
        <div className="mt-2 bg-slate-900 text-white p-3 rounded-xl border border-slate-700 text-xs shadow-xl max-w-xs mx-auto animate-in fade-in">
          <p className="font-medium text-teal-400 mb-1">Install on iPhone / iPad:</p>
          <p className="text-slate-300">Tap the Share button in Safari, then tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</p>
          <button
            onClick={() => setShowIosGuide(false)}
            className="mt-2 text-xs text-teal-400 hover:underline block ml-auto"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
