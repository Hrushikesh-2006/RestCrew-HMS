"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Calendar, Check, ChevronRight, MessageSquare,
  ShieldCheck, Clock
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { StudentLayout } from '@/components/student/student-sidebar';
import { AuthGuard } from '@/components/shared/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const typeStyles: Record<string, { icon: LucideIcon, color: string, bg: string, border: string }> = {
  General: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  Payment: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Meal: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Complaint: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

export default function StudentNotificationsPage() {
  const { student } = useAuthStore();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hostelName, setHostelName] = useState('');

  useEffect(() => {
    if (!student?.id) return;

    const loadNotifications = async () => {
      try {
        const response = await requestJson<{ notifications: Notification[], student: { hostelName: string } }>(
          `/api/students/${student.id}/dashboard`
        );
        setNotifications(response.notifications);
        setHostelName(response.student.hostelName);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load your notifications.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [student?.id, toast]);

  const markAsRead = async (id: string) => {
    try {
      await requestJson(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      await Promise.all(unreadIds.map(id => 
        requestJson(`/api/notifications/${id}/read`, { method: 'PATCH' })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast({ title: 'Success', description: 'All notifications marked as read.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update some notifications.', variant: 'destructive' });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthGuard allowedRole="student">
      <StudentLayout>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="gradient-text-alt text-3xl font-bold">Notice Board</h1>
              <p className="text-sm text-muted-foreground mt-1">Updates and messages from <span className="text-orange-400 font-semibold">{hostelName}</span> management.</p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="glass border-white/10 opacity-50 animate-pulse">
                    <CardContent className="h-24" />
                  </Card>
                ))
              ) : notifications.length === 0 ? (
                <Card className="glass border-orange-500/30">
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                      <Bell className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold">No Notifications</h3>
                    <p className="text-sm text-muted-foreground mt-2">When your owner sends a notice, it will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((n, index) => {
                    const style = typeStyles[n.type] || typeStyles.General;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={cn(
                            "glass border-white/10 hover:border-white/20 transition-all cursor-pointer group",
                            !n.isRead && "border-orange-500/30 bg-orange-500/5"
                          )}
                          onClick={() => !n.isRead && markAsRead(n.id)}
                        >
                          <CardContent className="p-5">
                            <div className="flex gap-4">
                              <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                style.bg, style.border
                              )}>
                                <style.icon className={cn("h-6 w-6", style.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className={cn("font-bold text-base truncate", !n.isRead ? "text-orange-400" : "text-foreground")}>
                                    {n.title}
                                  </h3>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {n.message}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                  <Badge variant="outline" className={cn("text-[10px] border-white/10", style.color)}>
                                    {n.type}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            <div className="space-y-6">
              <Card className="glass border-white/10 overflow-hidden">
                <CardHeader className="bg-orange-500/5 border-b border-white/5">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-orange-400" />
                    Security Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Personal and payment-related notices are sent by your hostel management. Please verify all information before making payments.
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold">Session Active</p>
                      <p className="text-[9px] text-muted-foreground">Your login info is securely stored locally.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-3xl border border-orange-500/20 bg-orange-500/5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mx-auto mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold mb-1">Need help?</h4>
                <p className="text-xs text-muted-foreground mb-4">Report an issue to management if you have any questions about a notice.</p>
                <Button size="sm" variant="outline" className="w-full border-orange-500/30 text-orange-400" onClick={() => window.location.href='/student/complaints'}>
                  Raise Complaint
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </StudentLayout>
    </AuthGuard>
  );
}
