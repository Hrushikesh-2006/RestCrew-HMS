'use client';

import { ThemeToggle } from "@/components/theme-toggle";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Bell,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { StudentLayout } from '@/components/student/student-sidebar';
import { AuthGuard } from '@/components/shared/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardLiveUpdates } from '@/hooks/use-dashboard-live-updates';

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

type StudentNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type MealMenuRecord = {
  item: string;
  description?: string;
};

type StudentMeal = {
  id: string;
  date: string;
  type: string;
  menu: Array<string | MealMenuRecord>;
  timing: string;
  rsvp: boolean | null;
};

type DashboardPayload = {
  student: StudentProfile;
  room: StudentRoom;
  fees: StudentFee[];
  complaints: StudentComplaint[];
  notifications: StudentNotification[];
  meals: StudentMeal[];
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const { student, updateStudentRoom } = useAuthStore();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirection handled by AuthGuard wrapper

  const loadDashboard = async () => {
    if (!student?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await requestJson<DashboardPayload>(`/api/students/${student.id}/dashboard`);
      setDashboard(response || null);
      updateStudentRoom(response.room?.id, response.room?.roomNumber);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setDashboard(null);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useDashboardLiveUpdates({
    ownerId: student?.ownerId,
    onUpdate: loadDashboard,
    enabled: Boolean(student?.ownerId),
  });

  useEffect(() => {
    loadDashboard();
  }, [student?.id]);

  const markAsRead = async (id: string) => {
    try {
      await requestJson(`/api/notifications/${id}/read`, { method: 'PATCH' });
      loadDashboard();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleRSVP = async (mealId: string, willAttend: boolean) => {
    try {
      await requestJson('/api/meals/rsvp', {
        method: 'POST',
        body: JSON.stringify({
          mealId,
          studentId: student?.id,
          willAttend,
        }),
      });
      loadDashboard();
    } catch (error) {
      console.error('RSVP Failed', error);
    }
  };

  if (!student) return null;

  // Show loading state
  if (isLoading) {
    return (
      <AuthGuard allowedRole="student">
        <StudentLayout>
          <div className="h-screen relative overflow-hidden flex items-center justify-center bg-[#020617]">
            <div className="absolute inset-0 hero-pattern opacity-40" />
            <div className="relative z-10 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
              <p className="mt-4 text-purple-400">Loading your dashboard...</p>
            </div>
          </div>
        </StudentLayout>
      </AuthGuard>
    );
  }

  // Show error state if data failed to load
  if (error || !dashboard) {
    return (
      <AuthGuard allowedRole="student">
        <StudentLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error || 'Unable to retrieve dashboard information.'}</p>
            <Button onClick={loadDashboard} className="bg-purple-600 hover:bg-purple-700">
              Retry Loading
            </Button>
          </div>
        </StudentLayout>
      </AuthGuard>
    );
  }

  const activeStudent = dashboard.student;
  const room = dashboard.room;
  const fees = dashboard.fees || [];
  const complaints = dashboard.complaints || [];
  const notifications = dashboard.notifications || [];
  const meals = dashboard.meals || [];
  const pendingFees = fees.filter((fee) => fee.status !== 'Paid').reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = fees.filter((fee) => fee.status === 'Paid').reduce((sum, fee) => sum + fee.amount, 0);
  const openComplaints = complaints.filter((complaint) => complaint.status !== 'Resolved').length;

  return (
    <AuthGuard allowedRole="student">
      <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="gradient-text-alt text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You are connected to {activeStudent.hostelName} with the details created by your hostel owner.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Profile Section */}
        <Card className="glass card-3d overflow-hidden border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-4xl bg-linear-to-br from-amber-500 to-orange-500 text-3xl font-bold text-white shadow-lg shadow-amber-500/20">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DoorOpen className="h-4 w-4 shrink-0" />
                    <span>{room ? `Room ${room.roomNumber}` : 'Room not assigned yet'}</span>
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

        {/* Stats Grid */}
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

        {/* Meal RSVP Section */}
        {meals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                Today&apos;s Meals
              </h2>
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                Action Required
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {meals.map((meal) => (
                <Card key={meal.id} className="glass card-3d overflow-hidden border-white/10 group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        {meal.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{meal.timing}</span>
                    </div>
                    <CardTitle className="mt-2 text-lg group-hover:gradient-text transition-all">
                      {meal.menu
                        .map((m) => typeof m === 'string' ? m : m.item)
                        .join(', ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {meal.rsvp === null ? (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                            onClick={() => handleRSVP(meal.id, true)}
                          >
                            Attend
                          </Button>
                          <Button 
                             variant="outline"
                            className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleRSVP(meal.id, false)}
                          >
                            Skip
                          </Button>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center p-3 rounded-xl border ${
                          meal.rsvp 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/5 border-red-500/20 text-red-400'
                        }`}>
                          <span className="text-sm font-bold uppercase tracking-wider">
                            {meal.rsvp ? 'Attending ✓' : 'Skipping ✗'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-6 text-[10px] text-slate-500"
                            onClick={() => handleRSVP(meal.id, !meal.rsvp)}
                          >
                            Change
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Recent Notifications */}
          <Card className="glass border-white/10 xl:col-span-2 overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-400" />
                  Recent Notifications
                </div>
                {notifications.some(n => !n.isRead) && (
                  <Badge className="bg-purple-500 animate-pulse-glow">NEW</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.slice(0, 6).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex flex-col gap-2 p-6 transition-all hover:bg-white/2 ${!notification.isRead ? 'bg-purple-500/3' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            notification.type === 'Payment' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            notification.type === 'Meal' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_var(--primary-glow)]" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className={`font-bold ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                      {notification.type === 'Meal' && (
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-xs text-cyan-400 justify-start hover:text-cyan-300"
                          onClick={() => router.push('/student/meals')}
                        >
                          Check Menu & RSVP <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-500 mb-4">
                    <Bell className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">Everything caught up! No notifications.</p>
                </div>
              )}
              {notifications.length > 6 && (
                <div className="p-4 border-t border-white/5 text-center">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-500">View All Notifications</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Complaints */}
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

          {/* Fees */}
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
      </div>
      </StudentLayout>
    </AuthGuard>
  );
}
