"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: "owner" | "student";
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, userType, hasHydrated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        // Not authenticated? Go to root or relevant login
        const loginPath = allowedRole === "owner" ? "/owner/login" : 
                         allowedRole === "student" ? "/student/login" : "/";
        router.push(loginPath);
      } else if (allowedRole && userType !== allowedRole) {
        // Wrong role? Go to their specific dashboard or root
        const homePath = userType === "owner" ? "/owner/dashboard" : "/student/dashboard";
        router.push(homePath);
      } else {
        // All good!
        setIsAuthorized(true);
      }
    }
  }, [hasHydrated, isAuthenticated, userType, allowedRole, router]);

  if (!hasHydrated || (!isAuthorized && isAuthenticated)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="absolute -inset-24 bg-purple-500/10 blur-3xl rounded-full" />
          <Loader2 className="h-10 w-10 animate-spin text-purple-500 relative z-10" />
          <p className="text-slate-400 text-sm animate-pulse relative z-10">Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
