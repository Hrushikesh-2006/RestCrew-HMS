'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  DoorOpen,
  Mail,
  Phone,
  School,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { StudentLayout } from '@/components/student/student-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type StudentProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  hostelName: string;
};

type StudentRoom = {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
} | null;

type StudentFee = {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  month: string;
};

type StudentComplaint = {
  id: string;
  title: string;
  category: string;
  status: string;
};

type DashboardPayload = {
  student: StudentProfile;
  room: StudentRoom;
  fees: StudentFee[];
  complaints: StudentComplaint[];
  meals: unknown[];
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const { student, isAuthenticated, userType } = useAuthStore();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      router.push('/student/login');
    }
  }, [isAuthenticated, userType, router]);

  useEffect(() => {
    if (!student?.id) return;

    const loadDashboard = async () => {
      try {
        const response = await requestJson<DashboardPayload>(`/api/students/${student.id}/dashboard`);
        setDashboard(response);
      } catch {
        setDashboard(null);
      }
    };

    loadDashboard();
  }, [student?.id]);

  if (!student) return null;

  const activeStudent = dashboard?.student ?? {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone ?? '',
    college: student.college ?? '',
    hostelName: student.hostelName ?? 'My Hostel',
  };

  const room = dashboard?.room ?? null;
  const fees = dashboard?.fees ?? [];
  const complaints = dashboard?.complaints ?? [];
  const pendingFees = fees.filter((fee) => fee.status !== 'Paid').reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = fees.filter((fee) => fee.status === 'Paid').reduce((sum, fee) => sum + fee.amount, 0);
  const openComplaints = complaints.filter((complaint) => complaint.status !== 'Resolved').length;

  return (
    <StudentLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="gradient-text-alt text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You are connected to {activeStudent.hostelName} with the details created by your hostel owner.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <Card className="glass card-3d overflow-hidden border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-500 text-3xl font-bold text-white shadow-lg shadow-amber-500/20">
                {activeStudent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{activeStudent.name}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{activeStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{activeStudent.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <School className="h-4 w-4 shrink-0" />
                    <span>{activeStudent.college || 'No college added'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>{activeStudent.hostelName}</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-amber-500/30 px-4 py-2 text-amber-300">
                <User className="mr-2 h-4 w-4" />
                Hostel Linked
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Pending Fees',
              value: pendingFees ? `Rs ${pendingFees.toLocaleString()}` : 'All Clear',
              subtext: `Rs ${paidFees.toLocaleString()} paid`,
              icon: DollarSign,
            },
            {
              title: 'Open Complaints',
              value: openComplaints,
              subtext: `${complaints.length} total records`,
              icon: AlertTriangle,
            },
            {
              title: 'Assigned Room',
              value: room ? `R${room.roomNumber}` : 'Pending',
              subtext: room ? `Floor ${room.floor} • ${room.capacity} sharing` : 'Ask owner for room assignment',
              icon: DoorOpen,
            },
            {
              title: 'Portal Status',
              value: 'Connected',
              subtext: 'Owner-created login matched',
              icon: CheckCircle2,
            },
          ].map((card) => (
            <Card key={card.title} className="glass card-3d-flat overflow-hidden border-white/10">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
                My Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              {complaints.length > 0 ? (
                <div className="space-y-3">
                  {complaints.slice(0, 4).map((complaint) => (
                    <div key={complaint.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{complaint.title}</p>
                          <p className="text-xs text-muted-foreground">{complaint.category}</p>
                        </div>
                        <Badge variant="outline">{complaint.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
                  No complaint records found yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-300" />
                Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fees.length > 0 ? (
                <div className="space-y-3">
                  {fees.slice(0, 4).map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div>
                        <p className="font-medium">{fee.month}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(fee.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Rs {fee.amount.toLocaleString()}</p>
                        <Badge variant="outline">{fee.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
                  No fee records found yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </StudentLayout>
  );
}
