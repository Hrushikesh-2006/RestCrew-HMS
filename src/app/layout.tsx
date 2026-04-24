import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/shared/pwa-register";
import { AutomatedReminders } from "@/components/shared/automated-reminders";
import { HydrationWrapper } from "@/components/shared/hydration-wrapper";
import { ThemeProvider } from "@/lib/theme-provider";

import { PwaInstallButton } from "@/components/shared/pwa-install-button";

export const metadata: Metadata = {
  title: "RestCrew - Modern Hostel Management System",
  description: "A beautiful, modern hostel management system for owners and students",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RestCrew",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased app-shell">
        {process.env.NODE_ENV === 'production' && <PwaRegister />}
        <AutomatedReminders />
        <HydrationWrapper>
          <div className="app-content">
            <ThemeProvider defaultTheme="light" storageKey="theme">
              {children}
              <PwaInstallButton />
            </ThemeProvider>
          </div>
          <Toaster />
        </HydrationWrapper>
      </body>
    </html>
  );
}
