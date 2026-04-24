'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Filter, Clock, CheckCircle2, XCircle,
  Zap, Wifi, Droplets, UtensilsCrossed, Brush, Monitor, HelpCircle
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore, Complaint } from '@/lib/data-store';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function OwnerComplaintsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType } = useAuthStore();
  const { complaints, updateComplaint } = useDataStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!owner) return null;

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  });

  const openCount = complaints.filter(c => c.status === 'Open').length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleStatusChange = (complaint: Complaint, newStatus: string) => {
    updateComplaint(complaint.id, { 
      status: newStatus as Complaint['status'],
      updatedAt: new Date().toISOString()
    });
    toast({
      title: 'Status Updated',
      description: `Complaint marked as ${newStatus}`,
    });
  };

  const handleAddNotes = () => {
    if (!selectedComplaint || !notes.trim()) return;
    
    updateComplaint(selectedComplaint.id, {
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    });
    
    toast({
      title: 'Notes Added',
      description: 'Resolution notes have been saved.',
    });
    
    setSelectedComplaint(null);
    setNotes('');
  };

  return (
    <OwnerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Complaint Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and resolve student complaints
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Complaints', value: complaints.length, icon: AlertTriangle, color: 'slate' },
            { label: 'Open', value: openCount, icon: XCircle, color: 'red' },
            { label: 'Pending', value: pendingCount, icon: Clock, color: 'amber' },
            { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'green' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'slate' ? 'bg-slate-500/20 text-slate-400' :
                    stat.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    stat.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    <stat.icon className="w-6 h-6" />
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

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by:</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 input-dark">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 input-dark">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredComplaints.map((complaint, index) => {
              const categoryInfo = getCategoryInfo(complaint.category);
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`glass hover:shadow-lg transition-all cursor-pointer ${
                    complaint.status === 'Open' ? 'border-l-4 border-l-red-500' :
                    complaint.status === 'Pending' ? 'border-l-4 border-l-amber-500' :
                    'border-l-4 border-l-green-500'
                  }`}
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setNotes(complaint.notes || '');
                  }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            `bg-${categoryInfo.color}-500/20 text-${categoryInfo.color}-400`
                          }`}
                          style={{
                            backgroundColor: `rgba(var(--${categoryInfo.color}-500), 0.2)`,
                          }}
                          >
                            <CategoryIcon className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold">{complaint.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {complaint.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {complaint.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>By: {complaint.studentName}</span>
                              <span>•</span>
                              <span>{formatDate(complaint.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => handleStatusChange(complaint, value)}
                          >
                            <SelectTrigger className={`w-28 input-dark ${getStatusColor(complaint.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {complaint.notes && (
                        <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-border/30">
                          <p className="text-xs text-muted-foreground mb-1">Resolution Notes:</p>
                          <p className="text-sm">{complaint.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-400/50 mb-4" />
            <p className="text-muted-foreground">No complaints found</p>
          </div>
        )}
      </motion.div>

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Complaint Details</DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getStatusColor(selectedComplaint.status)}>
                  {getStatusIcon(selectedComplaint.status)}
                  <span className="ml-1">{selectedComplaint.status}</span>
                </Badge>
                <Badge variant="outline">
                  {selectedComplaint.category}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{selectedComplaint.title}</h3>
                <p className="text-muted-foreground mt-2">{selectedComplaint.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Submitted by</p>
                  <p className="font-medium">{selectedComplaint.studentName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Update Status</p>
                <div className="flex gap-2">
                  {['Open', 'Pending', 'Resolved'].map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedComplaint.status === status ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(selectedComplaint, status)}
                      className={selectedComplaint.status === status 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600'
                        : 'border-border'
                      }
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Resolution Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about the resolution..."
                  className="input-dark min-h-[100px]"
                />
                <Button
                  onClick={handleAddNotes}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}
