'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import Image from 'next/image';
import { 
  LayoutDashboard, DoorOpen, Users, UtensilsCrossed, 
  AlertTriangle, DollarSign, BarChart3, LogOut,
  Settings, Menu, X, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}

const ownerNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/owner/dashboard', gradient: 'from-purple-500 to-pink-500' },
  { label: 'Rooms', icon: DoorOpen, href: '/owner/rooms', gradient: 'from-cyan-500 to-blue-500' },
  { label: 'Students', icon: Users, href: '/owner/students', gradient: 'from-green-500 to-emerald-500' },
  { label: 'Meals', icon: UtensilsCrossed, href: '/owner/meals', gradient: 'from-orange-500 to-amber-500' },
  { label: 'Complaints', icon: AlertTriangle, href: '/owner/complaints', gradient: 'from-red-500 to-rose-500' },
  { label: 'Fees', icon: DollarSign, href: '/owner/fees', gradient: 'from-yellow-500 to-amber-500' },
  { label: 'Notifications', icon: Bell, href: '/owner/notifications', gradient: 'from-blue-600 to-cyan-500' },
  { label: 'Analytics', icon: BarChart3, href: '/owner/analytics', gradient: 'from-indigo-500 to-purple-500' },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { owner, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center justify-between px-3 sm:px-4 shadow-xs">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-1 rounded-xl text-foreground hover:bg-muted transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="RestCrew" width={28} height={28} className="rounded-md" />
          <span className="font-bold gradient-text text-sm">RestCrew</span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Backdrop Overlay - Clean solid, no blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/70 z-50 transition-opacity"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Solid surface with no glassmorphism */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="RestCrew" width={36} height={36} className="rounded-xl" />
              <div>
                <h1 className="text-base font-bold gradient-text">RestCrew</h1>
                <p className="text-[11px] text-muted-foreground font-medium">Owner Panel</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {owner && (
          <div className="p-3 border-b border-border">
            <div className="bg-muted/50 rounded-xl p-2.5 border border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {owner.name ? owner.name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{owner.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{owner.hostelName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {ownerNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors duration-150 group',
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0",
                  `bg-gradient-to-br ${item.gradient}`,
                  isActive ? "shadow-sm opacity-100" : "opacity-75 group-hover:opacity-100"
                )}>
                  <item.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => handleNavClick('/owner/settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <OwnerSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 p-3 sm:p-5 lg:p-8 min-h-screen max-w-full overflow-x-hidden flex-1 transition-all">
        {children}
      </main>
    </div>
  );
}
