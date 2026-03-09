'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, DoorOpen, DollarSign, AlertTriangle, UtensilsCrossed,
  Clock, CheckCircle2, Calendar, Phone, Mail, School
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { StudentLayout } from '@/components/student/student-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

export default function StudentDashboardPage() {
  const router = useRouter();
  const { student, isAuthenticated, userType } = useAuthStore();
  const { rooms, fees, complaints, meals, mealParticipations } = useDataStore();

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      router.push('/student/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!student) return null;

  // Get student's room
  const room = rooms.find(r => r.id === student.roomId);
  
  // Get student's fees
  const studentFees = fees.filter(f => f.studentId === student.id);
  const paidFees = studentFees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
  const pendingFees = studentFees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amount, 0);
  
  // Get student's complaints
  const studentComplaints = complaints.filter(c => c.studentId === student.id);
  const openComplaints = studentComplaints.filter(c => c.status !== 'Resolved').length;
  
  // Get today's meals
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date === today);

  return (
    <StudentLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 lg:space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text-reverse">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Welcome back, {student.name}!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:gap-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold shadow-lg shadow-amber-500/30">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl lg:text-2xl font-bold">{student.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 mt-3 lg:mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm lg:text-base">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm lg:text-base">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{student.phone}</span>
                      </div>
                    )}
                    {student.college && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm lg:text-base">
                        <School className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{student.college}</span>
                      </div>
                    )}
                  </div>
                </div>
                {room && (
                  <div className="flex flex-col items-start md:items-end gap-1 lg:gap-2">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-base lg:text-lg px-3 lg:px-4 py-1">
                      <DoorOpen className="w-4 h-4 mr-2" />
                      Room {room.roomNumber}
                    </Badge>
                    <span className="text-xs lg:text-sm text-muted-foreground">
                      {room.capacity}-sharing • Floor {room.floor}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            {
              title: 'Fee Status',
              value: pendingFees > 0 ? `₹${pendingFees.toLocaleString()}` : 'All Clear',
              icon: DollarSign,
              color: pendingFees > 0 ? 'red' : 'green',
              subtext: `₹${paidFees.toLocaleString()} paid`
            },
            {
              title: 'Active Complaints',
              value: openComplaints,
              icon: AlertTriangle,
              color: openComplaints > 0 ? 'amber' : 'teal',
              subtext: `${studentComplaints.length} total`
            },
            {
              title: "Today's Meals",
              value: todayMeals.length,
              icon: UtensilsCrossed,
              color: 'amber',
              subtext: 'scheduled'
            },
            {
              title: 'Room',
              value: room ? `R${room.roomNumber}` : 'Not Set',
              icon: DoorOpen,
              color: room ? 'teal' : 'red',
              subtext: room ? `${room.capacity}-sharing` : 'Contact owner'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="glass h-full">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-start justify-between mb-1 lg:mb-2">
                    <p className="text-xs lg:text-sm text-muted-foreground">{stat.title}</p>
                    <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center ${
                      stat.color === 'red' ? 'bg-red-500/20 text-red-400' :
                      stat.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                      stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      'bg-teal-500/20 text-teal-400'
                    }`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-lg lg:text-xl font-bold truncate">{stat.value}</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State for new students */}
        {studentFees.length === 0 && studentComplaints.length === 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass border-amber-500/30">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 lg:w-8 lg:h-8 text-amber-400" />
                </div>
                <h2 className="text-lg lg:text-xl font-bold mb-2">Welcome to RestCrew!</h2>
                <p className="text-muted-foreground mb-4 text-sm lg:text-base">
                  {room 
                    ? "You're all set! View your meals, submit complaints, or check your fees."
                    : "Your account is ready. Contact the hostel owner for room assignment."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Content Grid */}
        {(studentFees.length > 0 || studentComplaints.length > 0) && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Recent Complaints */}
            <Card className="glass">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" />
                  My Complaints
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                {studentComplaints.length > 0 ? (
                  <div className="space-y-3">
                    {studentComplaints.slice(0, 4).map(complaint => (
                      <div
                        key={complaint.id}
                        className="p-3 rounded-xl bg-slate-800/50 border border-border/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm lg:text-base truncate">{complaint.title}</span>
                          <Badge variant="outline" className={`
                            text-[10px] lg:text-xs ml-2 flex-shrink-0
                            ${complaint.status === 'Open' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                              complaint.status === 'Pending' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                              'border-green-500/30 text-green-400 bg-green-500/10'}
                          `}>
                            {complaint.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{complaint.category}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-10 h-10 lg:w-12 lg:h-12 mx-auto text-green-400/50 mb-2" />
                    <p className="text-muted-foreground text-sm">No complaints submitted</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Status */}
            <Card className="glass">
              <CardHeader className="p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                  Fee Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                {studentFees.length > 0 ? (
                  <div className="space-y-3">
                    {studentFees.slice(0, 4).map(fee => (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-border/30"
                      >
                        <div>
                          <p className="font-medium text-sm lg:text-base">{fee.month}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(fee.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm lg:text-base">₹{fee.amount.toLocaleString()}</p>
                          <Badge variant="outline" className={`text-[10px] lg:text-xs ${
                            fee.status === 'Paid' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                            fee.status === 'Pending' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                            'border-red-500/30 text-red-400 bg-red-500/10'
                          }`}>
                            {fee.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-10 h-10 lg:w-12 lg:h-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground text-sm">No fee records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </StudentLayout>
  );
}
