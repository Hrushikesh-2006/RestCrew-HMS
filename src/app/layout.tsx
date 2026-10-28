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
  applicationName: "RestCrew",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RestCrew",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased app-shell">
        <PwaRegister />
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
