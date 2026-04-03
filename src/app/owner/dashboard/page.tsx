'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers3,
  Link2,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
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
  const { owner, isAuthenticated, userType } = useAuthStore();
  const [summary, setSummary] = useState<OwnerSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [isAuthenticated, userType, router]);

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
    <OwnerLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="gradient-text text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {owner.hostelName} is now using shared owner-student database mapping.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="glass card-3d-flat overflow-hidden border-white/10">
              <CardContent className="relative p-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.tint}`} />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="mt-2 text-2xl font-bold">{isLoading ? '...' : card.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers3 className="h-5 w-5 text-teal-300" />
                Owner To Student Flow
              </CardTitle>
              <Badge variant="outline" className="border-teal-500/30 text-teal-300">
                Live
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Owner account creates a hostel record in Prisma.',
                'Owner adds a student from the Student Records page.',
                'That student is saved with the same owner ID.',
                'Student signs in with the saved email and password.',
                'RestCrew resolves the student back to the same hostel platform.',
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-amber-300" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => router.push('/owner/students')} className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Student Login
              </Button>
              <Button onClick={() => router.push('/owner/rooms')} variant="outline" className="w-full justify-start">
                <Building className="mr-2 h-4 w-4" />
                Manage Rooms
              </Button>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
                Blockchain is not required for login linkage. The reliable path is owner-to-student relational mapping in the database, which is now in place.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-rose-300" />
                Recent Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary.recentComplaints.length > 0 ? (
                <div className="space-y-3">
                  {summary.recentComplaints.map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div>
                        <p className="font-medium">{complaint.title}</p>
                        <p className="text-xs text-muted-foreground">{complaint.category}</p>
                      </div>
                      <Badge variant="outline">{complaint.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
                  No complaint records yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="h-5 w-5 text-teal-300" />
                Fee Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Paid', amount: summary.paidFees, count: summary.paidFeeCount, icon: CheckCircle2 },
                { label: 'Pending', amount: summary.pendingFees, count: summary.pendingFeeCount, icon: Clock },
                { label: 'Overdue', amount: summary.overdueFees, count: summary.overdueFeeCount, icon: AlertTriangle },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.count} records</p>
                    </div>
                  </div>
                  <p className="font-semibold">Rs {item.amount.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </OwnerLayout>
  );
}
