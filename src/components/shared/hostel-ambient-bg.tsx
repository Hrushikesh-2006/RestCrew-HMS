"use client";

import { useEffect, useState } from 'react';

export function HostelAmbientBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10 bg-background opacity-0" aria-hidden="true" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 bg-background hostel-bg-layer" aria-hidden="true" />
  );
}
