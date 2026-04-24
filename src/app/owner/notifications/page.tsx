"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Send, Users, Search, CheckCircle2, 
  AlertCircle, Info, Clock, Check
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { AuthGuard } from '@/components/shared/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Student = {
  id: string;
  name: string;
  email: string;
  college?: string;
};

const notificationTypes = [
  { value: 'General', label: 'General Info', icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'Payment', label: 'Payment Alert', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'Meal', label: 'Meal Update', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'Complaint', label: 'Complaint Response', icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function OwnerNotificationsPage() {
  const { owner } = useAuthStore();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'General'
  });

  useEffect(() => {
    if (!owner?.id) return;

    const loadStudents = async () => {
      try {
        const response = await requestJson<{ students: Student[] }>(`/api/owners/${owner.id}/students`);
        setStudents(response.students);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load students list.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [owner?.id, toast]);

  const filteredStudents = useMemo(() => 
    students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery, students]
  );

  const toggleAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      toast({ title: 'No Selection', description: 'Please select at least one student.', variant: 'destructive' });
      return;
    }
    if (!form.title || !form.message) {
      toast({ title: 'Missing Info', description: 'Please fill in both title and message.', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      await requestJson('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          studentIds: selectedStudents,
          ownerId: owner?.id,
          type: form.type,
          title: form.title,
          message: form.message
        })
      });

      toast({
        title: 'Success!',
        description: `Notification sent to ${selectedStudents.length} students.`,
      });

      // Reset form
      setForm({ title: '', message: '', type: 'General' });
      setSelectedStudents([]);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send notifications. Use database mapping check.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthGuard allowedRole="owner">
      <OwnerLayout>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="gradient-text text-3xl font-bold">Broadcast Notices</h1>
              <p className="text-sm text-muted-foreground mt-1">Send real-time updates and messages to your students.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Bell className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            {/* Main Form */}
            <Card className="glass border-white/10 card-3d-flat">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-400" />
                  Compose Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {notificationTypes.map((t) => {
                        const isSelected = form.type === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, type: t.value }))}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200",
                              isSelected 
                                ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/5" 
                                : "border-white/5 hover:border-white/10 bg-white/5"
                            )}
                          >
                            <t.icon className={cn("h-5 w-5", t.color)} />
                            <span className="text-xs font-medium">{t.label}</span>
                            {isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <Label>Subject / Title</Label>
                      <Input
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g., Dinner Time Changed"
                        className="input-dark"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description / Message</Label>
                      <Textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Type your announcement here..."
                        className="input-dark min-h-37.5 resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="text-sm text-muted-foreground">
                      Targeting <span className="text-blue-400 font-bold">{selectedStudents.length}</span> students
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSending || selectedStudents.length === 0}
                      className="bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 px-8"
                    >
                      {isSending ? (
                        <div className="spinner h-5 w-5 mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Broadcast
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Student Selector */}
            <div className="space-y-4">
              <Card className="glass border-white/10 flex flex-col h-150">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-400" />
                      Recipients
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleAll}
                      className="text-xs text-blue-400 hover:bg-blue-500/10"
                    >
                      {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search students..."
                      className="input-dark h-9 pl-9 text-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pt-2 space-y-1 custom-scrollbar">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                      <div className="spinner h-5 w-5" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs text-muted-foreground">No students found.</p>
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div 
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={cn(
                          "group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200",
                          selectedStudents.includes(student.id)
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-white/5 border-transparent hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                            selectedStudents.includes(student.id)
                              ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-lg"
                              : "bg-white/10 text-slate-400"
                          )}>
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate group-hover:text-blue-300 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate italic">
                              {student.college || 'Linked Student'}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                          selectedStudents.includes(student.id)
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white/5 border-white/10 text-transparent"
                        )}>
                          <Check className="h-3 w-3" strokeWidth={4} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 items-start">
                <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Broadcasting notices is logged in the system. Ensure all information is accurate before sending, as students will see this immediately on their notice board.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </OwnerLayout>
    </AuthGuard>
  );
}
