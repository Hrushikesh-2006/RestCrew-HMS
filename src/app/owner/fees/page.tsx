'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Plus, Check, Clock, AlertCircle, Send,
  Search, Download, Calendar, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore, Fee } from '@/lib/data-store';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function OwnerFeesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType } = useAuthStore();
  const { fees, students, addFee, updateFee } = useDataStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for new fee
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!owner) return null;

  const filteredFees = fees.filter(fee => {
    if (statusFilter !== 'all' && fee.status !== statusFilter) return false;
    if (searchQuery && !fee.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalFees = fees.reduce((acc, f) => acc + f.amount, 0);
  const paidFees = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
  const pendingFees = fees.filter(f => f.status === 'Pending').reduce((acc, f) => acc + f.amount, 0);
  const overdueFees = fees.filter(f => f.status === 'Overdue').reduce((acc, f) => acc + f.amount, 0);

  const paidCount = fees.filter(f => f.status === 'Paid').length;
  const pendingCount = fees.filter(f => f.status === 'Pending').length;
  const overdueCount = fees.filter(f => f.status === 'Overdue').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <Check className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Overdue': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'border-green-500/30 text-green-400 bg-green-500/10';
      case 'Pending': return 'border-orange-500/30 text-orange-400 bg-orange-500/10';
      case 'Overdue': return 'border-red-500/30 text-red-400 bg-red-500/10';
      default: return '';
    }
  };

  const handleStatusChange = (fee: Fee, newStatus: string) => {
    const updateData: Partial<Fee> = { 
      status: newStatus as Fee['status'],
    };
    
    if (newStatus === 'Paid') {
      updateData.paidDate = new Date().toISOString().split('T')[0];
    } else {
      updateData.paidDate = null;
    }
    
    updateFee(fee.id, updateData);
    
    toast({
      title: 'Status Updated',
      description: `Fee marked as ${newStatus}`,
    });
  };

  const handleSendReminder = (fee: Fee) => {
    const student = students.find(s => s.id === fee.studentId);
    if (!student) return;
    
    toast({
      title: 'Reminder Sent',
      description: `Fee reminder sent to ${fee.studentName} at ${student.email}`,
    });
  };

  const handleAddFee = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
      toast({
        title: 'Error',
        description: 'Please select a student.',
        variant: 'destructive',
      });
      return;
    }
    
    addFee({
      id: `fee_${Date.now()}`,
      amount: parseFloat(amount),
      dueDate,
      status: 'Pending',
      paidDate: null,
      month,
      studentId: student.id,
      studentName: student.name,
      ownerEmail: owner.email,
    });
    
    toast({
      title: 'Fee Added',
      description: `Fee of ₹${amount} added for ${student.name}`,
    });
    
    setIsDialogOpen(false);
    setStudentId('');
    setAmount('');
    setDueDate('');
    setMonth('');
  };

  const exportData = () => {
    if (fees.length === 0) {
      toast({
        title: 'No Data',
        description: 'No fees to export.',
        variant: 'destructive',
      });
      return;
    }
    
    const csvContent = [
      ['Student', 'Month', 'Amount', 'Status', 'Due Date', 'Paid Date'],
      ...fees.map(f => [
        f.studentName,
        f.month,
        f.amount.toString(),
        f.status,
        f.dueDate,
        f.paidDate || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fees.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'Fee data has been exported to CSV.',
    });
  };

  return (
    <OwnerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 lg:space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Fee Management</h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Track and manage student fee payments
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportData}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Download className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Add Fee</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {students.length === 0 && (
          <Card className="glass border-purple-500/20">
            <CardContent className="p-6 lg:p-12 text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold mb-2">No Students Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm lg:text-base">
                Add students first before you can create fee records for them.
              </p>
              <Button
                onClick={() => router.push('/owner/students')}
                variant="outline"
                className="border-purple-500/30 text-purple-400"
              >
                Go to Students
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: 'Total Fees', value: `₹${totalFees.toLocaleString()}`, icon: DollarSign, color: 'purple', gradient: 'from-purple-500 to-pink-500' },
            { label: 'Collected', value: `₹${paidFees.toLocaleString()}`, subtext: `${paidCount} payments`, icon: Check, color: 'green', gradient: 'from-green-500 to-emerald-500' },
            { label: 'Pending', value: `₹${pendingFees.toLocaleString()}`, subtext: `${pendingCount} payments`, icon: Clock, color: 'orange', gradient: 'from-orange-500 to-amber-500' },
            { label: 'Overdue', value: `₹${overdueFees.toLocaleString()}`, subtext: `${overdueCount} payments`, icon: AlertCircle, color: 'red', gradient: 'from-red-500 to-rose-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass h-full">
                <CardContent className="p-3 lg:p-4">
                  <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 shadow-lg`}>
                    <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg lg:text-xl font-bold">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        {students.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name..."
                className="pl-9 input-dark"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 input-dark">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Fees Table */}
        {students.length > 0 && (
          <Card className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/30 bg-slate-800/50">
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Student</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Month</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Amount</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Due Date</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredFees.map((fee, index) => (
                      <motion.tr
                        key={fee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-border/20 hover:bg-slate-800/30"
                      >
                        <td className="p-3 lg:p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                              {fee.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{fee.studentName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 lg:p-4 text-sm">{fee.month}</td>
                        <td className="p-3 lg:p-4">
                          <span className="font-medium">₹{fee.amount.toLocaleString()}</span>
                        </td>
                        <td className="p-3 lg:p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{new Date(fee.dueDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-3 lg:p-4">
                          <Select
                            value={fee.status}
                            onValueChange={(value) => handleStatusChange(fee, value)}
                          >
                            <SelectTrigger className={`w-24 input-dark text-xs ${getStatusColor(fee.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 lg:p-4">
                          <div className="flex gap-2">
                            {fee.status !== 'Paid' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendReminder(fee)}
                                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 h-8 text-xs"
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Remind
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(fee, 'Paid')}
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-8 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Paid
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredFees.length === 0 && fees.length > 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No fees found matching your search</p>
          </div>
        )}

        {fees.length === 0 && students.length > 0 && (
          <Card className="glass">
            <CardContent className="p-6 lg:p-12 text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                <DollarSign className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold mb-2">No Fee Records</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm lg:text-base">
                Start by adding fee records for your students.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Fee Record
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Add Fee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass max-w-md w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Add New Fee</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddFee} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="input-dark">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Month</Label>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="input-dark"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                className="input-dark"
                min="1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-dark"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Add Fee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}
