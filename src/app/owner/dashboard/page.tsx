'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, DoorOpen, DollarSign, AlertTriangle, TrendingUp, 
  Clock, CheckCircle2, XCircle, Plus, Building, Sparkles,
  UtensilsCrossed
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { owner, isAuthenticated, userType } = useAuthStore();
  const { students, rooms, complaints, fees } = useDataStore();

  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!owner) return null;

  // Calculate stats
  const totalStudents = students.length;
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = students.filter(s => s.roomId).length;
  const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;

  const paidFees = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
  const pendingFees = fees.filter(f => f.status === 'Pending').reduce((acc, f) => acc + f.amount, 0);
  const overdueFees = fees.filter(f => f.status === 'Overdue').reduce((acc, f) => acc + f.amount, 0);

  // Sample chart data
  const revenueData = Array(6).fill(null).map((_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    revenue: 0,
    expenses: 0
  }));

  const participationData = Array(7).fill(null).map((_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    breakfast: 0,
    lunch: 0,
    dinner: 0
  }));

  const recentComplaints = complaints.slice(0, 5);
  const isEmpty = totalStudents === 0 && totalRooms === 0;

  // Stat cards config
  const statCards = [
    {
      title: 'Total Students',
      value: totalStudents,
      change: 'Active',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/10'
    },
    {
      title: 'Room Occupancy',
      value: `${occupancyRate}%`,
      change: `${occupiedBeds}/${totalCapacity} beds`,
      icon: DoorOpen,
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/10'
    },
    {
      title: 'Revenue',
      value: `₹${paidFees.toLocaleString()}`,
      change: 'Collected',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 to-emerald-500/10'
    },
    {
      title: 'Open Complaints',
      value: openComplaints,
      change: `${pendingComplaints} pending`,
      icon: AlertTriangle,
      gradient: openComplaints > 0 ? 'from-red-500 to-rose-500' : 'from-green-500 to-emerald-500',
      bgGradient: openComplaints > 0 ? 'from-red-500/20 to-rose-500/10' : 'from-green-500/20 to-emerald-500/10'
    },
  ];

  return (
    <OwnerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 lg:space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Welcome back, {owner.name}! Here's your hostel overview.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </motion.div>

        {/* Empty State */}
        {isEmpty && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass border-purple-500/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5" />
              <CardContent className="relative p-6 lg:p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30"
                >
                  <Sparkles className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-3">Welcome to RestCrew!</h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm lg:text-base leading-relaxed">
                  Your hostel management dashboard is ready. Start by adding your rooms and students to see real-time statistics and analytics here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => router.push('/owner/rooms')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 h-11 lg:h-12"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rooms
                  </Button>
                  <Button
                    onClick={() => router.push('/owner/students')}
                    variant="outline"
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 h-11 lg:h-12"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className={`glass h-full bg-gradient-to-br ${stat.bgGradient} border-0`}>
                <CardContent className="p-3 lg:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-xl lg:text-2xl font-bold">{stat.value}</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Revenue Chart */}
          <Card className="glass">
            <CardHeader className="p-4 lg:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-2">
              <ChartContainer config={{}} className="h-[200px] lg:h-[250px]">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Meal Participation */}
          <Card className="glass">
            <CardHeader className="p-4 lg:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                Meal Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-2">
              <ChartContainer config={{}} className="h-[200px] lg:h-[250px]">
                <BarChart data={participationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="breakfast" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lunch" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dinner" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Recent Complaints */}
          <Card className="glass xl:col-span-2">
            <CardHeader className="p-4 lg:p-6 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                Recent Complaints
              </CardTitle>
              <Badge variant="outline" className="text-purple-400 border-purple-400/30 text-xs">
                {complaints.length} Total
              </Badge>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              {recentComplaints.length > 0 ? (
                <div className="space-y-3">
                  {recentComplaints.map((complaint) => (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          complaint.status === 'Open' ? 'bg-gradient-to-br from-red-500 to-rose-500' :
                          complaint.status === 'Pending' ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                          'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          {complaint.status === 'Open' ? <XCircle className="w-4 h-4 text-white" /> :
                           complaint.status === 'Pending' ? <Clock className="w-4 h-4 text-white" /> :
                           <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{complaint.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {complaint.studentName} • {complaint.category}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`
                        hidden sm:flex text-xs flex-shrink-0
                        ${complaint.status === 'Open' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                          complaint.status === 'Pending' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                          'border-green-500/30 text-green-400 bg-green-500/10'}
                      `}>
                        {complaint.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-muted-foreground text-sm">No complaints yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee Status */}
          <Card className="glass">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6 pt-0">
              <div className="space-y-3">
                <div className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs lg:text-sm text-muted-foreground">Paid</span>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-green-400">
                    ₹{paidFees.toLocaleString()}
                  </p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
                    {fees.filter(f => f.status === 'Paid').length} payments
                  </p>
                </div>
                <div className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs lg:text-sm text-muted-foreground">Pending</span>
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-orange-400">
                    ₹{pendingFees.toLocaleString()}
                  </p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
                    {fees.filter(f => f.status === 'Pending').length} payments
                  </p>
                </div>
                <div className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs lg:text-sm text-muted-foreground">Overdue</span>
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-red-400">
                    ₹{overdueFees.toLocaleString()}
                  </p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
                    {fees.filter(f => f.status === 'Overdue').length} payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </OwnerLayout>
  );
}
