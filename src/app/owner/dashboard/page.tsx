'use client';

import { ThemeToggle } from "@/components/theme-toggle";


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  Link2,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { AuthGuard } from '@/components/shared/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ComplaintSummary = {
  id: string;
  title: string;
  category: string;
  status: string;
};

type OwnerSummary = {
  totalStudents: number;
  totalRooms: number;
  totalCapacity: number;
  occupiedBeds: number;
  openComplaints: number;
  pendingComplaints: number;
  recentComplaints: ComplaintSummary[];
  paidFees: number;
  pendingFees: number;
  overdueFees: number;
  paidFeeCount: number;
  pendingFeeCount: number;
  overdueFeeCount: number;
};

const emptySummary: OwnerSummary = {
  totalStudents: 0,
  totalRooms: 0,
  totalCapacity: 0,
  occupiedBeds: 0,
  openComplaints: 0,
  pendingComplaints: 0,
  recentComplaints: [],
  paidFees: 0,
  pendingFees: 0,
  overdueFees: 0,
  paidFeeCount: 0,
  pendingFeeCount: 0,
  overdueFeeCount: 0,
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { owner } = useAuthStore();
  const [summary, setSummary] = useState<OwnerSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  // Redirection handled by AuthGuard wrapper

  useEffect(() => {
    if (!owner?.id) return;

    const loadSummary = async () => {
      setIsLoading(true);
      try {
        const response = await requestJson<OwnerSummary>(`/api/owners/${owner.id}/summary`);
        setSummary(response);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [owner?.id]);

  if (!owner) return null;

  const occupancyRate =
    summary.totalCapacity > 0 ? Math.round((summary.occupiedBeds / summary.totalCapacity) * 100) : 0;

  const cards = [
    {
      title: 'Linked Students',
      value: summary.totalStudents,
      detail: 'Database-backed accounts',
      icon: Users,
      tint: 'from-teal-500/25 to-cyan-500/10',
    },
    {
      title: 'Occupancy',
      value: `${occupancyRate}%`,
      detail: `${summary.occupiedBeds}/${summary.totalCapacity} beds used`,
      icon: Building,
      tint: 'from-sky-500/25 to-blue-500/10',
    },
    {
      title: 'Paid Fees',
      value: `Rs ${summary.paidFees.toLocaleString()}`,
      detail: `${summary.paidFeeCount} payments`,
      icon: DollarSign,
      tint: 'from-emerald-500/25 to-green-500/10',
    },
    {
      title: 'Open Issues',
      value: summary.openComplaints,
      detail: `${summary.pendingComplaints} pending`,
      icon: AlertTriangle,
      tint: 'from-rose-500/25 to-red-500/10',
    },
  ];

  return (
    <AuthGuard allowedRole="owner">
      <OwnerLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="gradient-text text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {owner.hostelName} management overview and real-time operations
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="rounded-full border border-border bg-card px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-muted-foreground font-medium shadow-2xs">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="bg-card border border-border shadow-xs card-3d-flat overflow-hidden">
              <CardContent className="relative p-4 sm:p-5">
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{card.title}</p>
                    <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">{isLoading ? '...' : card.value}</p>
                    <p className="mt-0.5 sm:mt-1 text-xs text-muted-foreground">{card.detail}</p>
                  </div>
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6">
          <Card className="bg-card border border-border shadow-xs">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2 space-y-2.5 sm:space-y-3">
              <Button onClick={() => router.push('/owner/students')} className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Student Login
              </Button>
              <Button onClick={() => router.push('/owner/rooms')} variant="outline" className="w-full justify-start">
                <Building className="mr-2 h-4 w-4" />
                Manage Rooms
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
          <Card className="bg-card border border-border shadow-xs">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500" />
                Recent Complaints
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              {summary.recentComplaints.length > 0 ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {summary.recentComplaints.map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3 sm:p-4">
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{complaint.title}</p>
                        <p className="text-[11px] text-muted-foreground">{complaint.category}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">{complaint.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6 text-xs sm:text-sm text-muted-foreground text-center">
                  No complaint records yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-xs">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
                Fee Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2 space-y-2.5 sm:space-y-3">
              {[
                { label: 'Paid', amount: summary.paidFees, count: summary.paidFeeCount, icon: CheckCircle2 },
                { label: 'Pending', amount: summary.pendingFees, count: summary.pendingFeeCount, icon: Clock },
                { label: 'Overdue', amount: summary.overdueFees, count: summary.overdueFeeCount, icon: AlertTriangle },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 p-3 sm:p-4">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{item.count} records</p>
                    </div>
                  </div>
                  <p className="font-semibold text-xs sm:text-sm whitespace-nowrap">Rs {item.amount.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
      </OwnerLayout>
    </AuthGuard>
  );
}
