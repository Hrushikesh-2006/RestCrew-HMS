'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  DollarSign, Calendar, CheckCircle2, Clock, AlertCircle,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore } from '@/lib/data-store';
import { StudentLayout } from '@/components/student/student-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function StudentFeesPage() {
  const router = useRouter();
  const { student, isAuthenticated, userType } = useAuthStore();
  const { fees, reminders } = useDataStore();

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      router.push('/student/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!student) return null;

  const myFees = fees.filter(f => f.studentId === student.id);
  const totalFees = myFees.reduce((acc, f) => acc + f.amount, 0);
  const paidFees = myFees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
  const pendingFees = myFees.filter(f => f.status === 'Pending').reduce((acc, f) => acc + f.amount, 0);
  const overdueFees = myFees.filter(f => f.status === 'Overdue').reduce((acc, f) => acc + f.amount, 0);

  const paidCount = myFees.filter(f => f.status === 'Paid').length;
  const pendingCount = myFees.filter(f => f.status === 'Pending').length;
  const overdueCount = myFees.filter(f => f.status === 'Overdue').length;

  const myReminders = reminders.filter(r => r.studentId === student.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle2 className="w-5 h-5" />;
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Overdue': return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'border-green-500/30 text-green-400 bg-green-500/10';
      case 'Pending': return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
      case 'Overdue': return 'border-red-500/30 text-red-400 bg-red-500/10';
      default: return '';
    }
  };

  const paymentProgress = totalFees > 0 ? (paidFees / totalFees) * 100 : 0;

  return (
    <StudentLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text-reverse">Fee Status</h1>
          <p className="text-muted-foreground mt-1">
            View and track your fee payments
          </p>
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Progress</p>
                  <p className="text-3xl font-bold">
                    ₹{paidFees.toLocaleString()} <span className="text-lg text-muted-foreground font-normal">/ ₹{totalFees.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-xl font-bold text-red-400">₹{(pendingFees + overdueFees).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <Progress value={paymentProgress} className="h-3 mb-4" />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Paid</span>
                  </div>
                  <p className="text-xl font-bold">₹{paidFees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{paidCount} payments</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <p className="text-xl font-bold">₹{pendingFees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{pendingCount} payments</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Overdue</span>
                  </div>
                  <p className="text-xl font-bold">₹{overdueFees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{overdueCount} payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reminders */}
        {myReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  Payment Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myReminders.slice(0, 3).map(reminder => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10"
                    >
                      <div>
                        <p className="font-medium">₹{reminder.amount.toLocaleString()} due</p>
                        <p className="text-xs text-muted-foreground">
                          Reminder sent on {new Date(reminder.sentAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                        Due: {new Date(reminder.dueDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Fee Records */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-slate-800/50">
                    <th className="text-left p-4 text-muted-foreground font-medium">Month</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Due Date</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myFees.map((fee, index) => (
                    <motion.tr
                      key={fee.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border/20 hover:bg-slate-800/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{fee.month}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-lg">₹{fee.amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span>{new Date(fee.dueDate).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={getStatusColor(fee.status)}>
                          {getStatusIcon(fee.status)}
                          <span className="ml-1">{fee.status}</span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        {fee.paidDate ? (
                          <span className="text-green-400">
                            {new Date(fee.paidDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {myFees.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No fee records found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact the hostel management for fee details
            </p>
          </div>
        )}

        {/* Info Card */}
        <Card className="glass border-teal-500/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Payment Information</h4>
                <p className="text-sm text-muted-foreground">
                  Please contact the hostel management or visit the office to make payments. 
                  Payment reminders will be sent to your registered email address for pending fees.
                  For any queries regarding fees, please submit a complaint through the complaints section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </StudentLayout>
  );
}
