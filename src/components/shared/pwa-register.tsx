'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Skip SW in development to avoid Turbopack cache issues
    if (process.env.NODE_ENV === 'development') {
      console.log('[PWA] Service worker disabled in development');
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service worker registration failed:', err);
      // Installability should not block the app if the service worker fails.
    });
  }, []);

  return null;
}
