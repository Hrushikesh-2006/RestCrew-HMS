'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Plus, Clock, CheckCircle2, XCircle,
  Zap, Wifi, Droplets, UtensilsCrossed, Brush, Monitor, HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore, Complaint } from '@/lib/data-store';
import { StudentLayout } from '@/components/student/student-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { id: 'Food', label: 'Food', icon: UtensilsCrossed, color: 'amber' },
  { id: 'Electricity', label: 'Electricity', icon: Zap, color: 'yellow' },
  { id: 'Washing Machine', label: 'Washing Machine', icon: Monitor, color: 'blue' },
  { id: 'WiFi', label: 'WiFi', icon: Wifi, color: 'purple' },
  { id: 'Cleaning', label: 'Cleaning', icon: Brush, color: 'green' },
  { id: 'Water', label: 'Water', icon: Droplets, color: 'cyan' },
  { id: 'Room Issues', label: 'Room Issues', icon: AlertTriangle, color: 'orange' },
  { id: 'Other', label: 'Other', icon: HelpCircle, color: 'gray' },
];

export default function StudentComplaintsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { student, isAuthenticated, userType } = useAuthStore();
  const { complaints, addComplaint } = useDataStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated || userType !== 'student') {
      router.push('/student/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!student) return null;

  const myComplaints = complaints.filter(c => c.studentId === student.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <XCircle className="w-5 h-5" />;
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Resolved': return <CheckCircle2 className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'Pending': return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
      case 'Resolved': return 'border-green-500/30 text-green-400 bg-green-500/10';
      default: return '';
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast({
        title: 'Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }
    
    const newComplaint: Complaint = {
      id: `complaint_${Date.now()}`,
      category: selectedCategory as Complaint['category'],
      title,
      description,
      status: 'Open',
      notes: '',
      studentId: student.id,
      studentName: student.name,
      ownerEmail: 'owner@restcrew.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addComplaint(newComplaint);
    
    toast({
      title: 'Complaint Submitted',
      description: 'Your complaint has been submitted successfully.',
    });
    
    setIsDialogOpen(false);
    setSelectedCategory('');
    setTitle('');
    setDescription('');
  };

  return (
    <StudentLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text-reverse">Complaints</h1>
            <p className="text-muted-foreground mt-1">
              Submit and track your complaints
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: myComplaints.length, icon: AlertTriangle, color: 'slate' },
            { label: 'Open', value: myComplaints.filter(c => c.status === 'Open').length, icon: XCircle, color: 'red' },
            { label: 'Pending', value: myComplaints.filter(c => c.status === 'Pending').length, icon: Clock, color: 'amber' },
            { label: 'Resolved', value: myComplaints.filter(c => c.status === 'Resolved').length, icon: CheckCircle2, color: 'green' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === 'slate' ? 'bg-slate-500/20 text-slate-400' :
                    stat.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    stat.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          <AnimatePresence>
            {myComplaints.length > 0 ? (
              myComplaints.map((complaint, index) => {
                const categoryInfo = getCategoryInfo(complaint.category);
                
                return (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`glass hover:shadow-lg transition-all ${
                      complaint.status === 'Open' ? 'border-l-4 border-l-red-500' :
                      complaint.status === 'Pending' ? 'border-l-4 border-l-amber-500' :
                      'border-l-4 border-l-green-500'
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/20 text-amber-400`}>
                              <categoryInfo.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-lg">{complaint.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {complaint.category}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-2">{complaint.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Submitted on {formatDate(complaint.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={getStatusColor(complaint.status)}>
                              {getStatusIcon(complaint.status)}
                              <span className="ml-1">{complaint.status}</span>
                            </Badge>
                          </div>
                        </div>
                        
                        {complaint.notes && (
                          <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-border/30">
                            <p className="text-xs text-muted-foreground mb-1">Response from management:</p>
                            <p className="text-sm">{complaint.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-400/50 mb-4" />
                <p className="text-muted-foreground">No complaints submitted yet</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                  className="mt-4 border-amber-500/30 text-amber-400"
                >
                  Submit your first complaint
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* New Complaint Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text-reverse">Submit a Complaint</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <p className="text-xs text-muted-foreground -mt-1">What type of issue is this?</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                        : 'bg-slate-800/50 border border-border/30 hover:border-amber-500/20'
                    }`}
                  >
                    <cat.icon className="w-5 h-5" />
                    <span className="text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your complaint"
                className="input-dark"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="input-dark min-h-[120px]"
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
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600"
              >
                Submit Complaint
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
