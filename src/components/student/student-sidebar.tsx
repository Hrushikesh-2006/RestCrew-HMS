'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { 
  LayoutDashboard, UtensilsCrossed, AlertTriangle, DollarSign,
  LogOut, Building2, User, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard', gradient: 'from-orange-500 to-amber-500' },
  { label: 'Meals', icon: UtensilsCrossed, href: '/student/meals', gradient: 'from-green-500 to-emerald-500' },
  { label: 'Complaints', icon: AlertTriangle, href: '/student/complaints', gradient: 'from-red-500 to-rose-500' },
  { label: 'Fees', icon: DollarSign, href: '/student/fees', gradient: 'from-cyan-500 to-blue-500' },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { student, logout } = useAuthStore();
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
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 glass-dark z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl hover:bg-orange-500/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text-alt text-sm">RestCrew</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        className={cn(
          "fixed left-0 top-0 h-screen w-60 lg:w-64 glass-dark flex flex-col z-50",
          "transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/20"
              >
                <Building2 className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-base font-bold gradient-text-alt">RestCrew</h1>
                <p className="text-[10px] text-muted-foreground">Student Portal</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {student && (
          <div className="px-3 py-3 border-b border-white/5">
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{student.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {student.roomNumber ? `Room ${student.roomNumber}` : 'No Room Assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {studentNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group',
                  'hover:bg-white/5',
                  isActive && 'bg-gradient-to-r from-orange-500/20 to-transparent border-l-2 border-orange-500'
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  `bg-gradient-to-br ${item.gradient}`,
                  isActive ? "shadow-lg" : "opacity-60 group-hover:opacity-100"
                )}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <StudentSidebar />
      <main className="lg:ml-60 lg:ml-64 pt-14 lg:pt-0 p-4 lg:p-6 page-transition min-h-screen">
        {children}
      </main>
    </div>
  );
}
