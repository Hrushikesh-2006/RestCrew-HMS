'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { Users, Plus, Edit2, Trash2, LogOut, Search, Phone, User, Download, Link2, ShieldCheck, Copy, KeyRound, CheckCheck, IdCard } from 'lucide-react';

import { useAuthStore } from '@/lib/auth-store';
import { requestJson } from '@/lib/api-client';
import { AuthGuard } from '@/components/shared/auth-guard';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type OwnerStudent = {
  id: string;
  userId: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  college: string;
  parentContact: string;
  address: string;
  roomId: string | null;
  roomNumber?: string;
  ownerId: string;
};

type HostelRoom = {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  studentCount: number;
};

type CreatedCredentials = {
  name: string;
  userId: string;
  password: string;
};

const emptyForm = {
  name: '',
  userId: '',
  password: '',
  phone: '',
  college: '',
  parentContact: '',
  address: '',
  roomId: 'unassigned',
};

export default function OwnerStudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType, hasHydrated } = useAuthStore();

  const [students, setStudents] = useState<OwnerStudent[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<OwnerStudent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  // Credentials popup after creating a student
  const [createdCreds, setCreatedCreds] = useState<CreatedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<'userId' | 'password' | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [hasHydrated, isAuthenticated, userType, router]);

  useEffect(() => {
    if (!owner?.id) return;
    const loadStudents = async () => {
      setIsLoading(true);
      try {
        const response = await requestJson<{ students: OwnerStudent[] }>(`/api/owners/${owner.id}/students`);
        setStudents(response.students);
      } catch (error) {
        toast({ title: 'Load Failed', description: error instanceof Error ? error.message : 'Unable to load students.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, [owner?.id, toast]);

  useEffect(() => {
    if (!owner?.id) return;
    const loadRooms = async () => {
      try {
        const response = await requestJson<{ rooms: HostelRoom[] }>(`/api/owner/${owner.id}/rooms`);
        setRooms(response.rooms);
      } catch (error) {
        toast({ title: 'Rooms Unavailable', description: error instanceof Error ? error.message : 'Unable to load hostel rooms.', variant: 'destructive' });
      }
    };
    loadRooms();
  }, [owner?.id, toast]);

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        [student.name, student.userId, student.college]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [searchQuery, students]
  );

  if (!hasHydrated || !owner) return null;

  const resetForm = () => {
    setEditingStudent(null);
    setForm(emptyForm);
  };

  const handleEdit = (student: OwnerStudent) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      userId: student.userId ?? '',
      password: '',
      phone: student.phone,
      college: student.college,
      parentContact: student.parentContact,
      address: student.address,
      roomId: student.roomId ?? 'unassigned',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (student: OwnerStudent) => {
    try {
      await requestJson(`/api/owners/${owner.id}/students/${student.id}`, { method: 'DELETE' });
      setStudents((current) => current.filter((item) => item.id !== student.id));
      toast({ title: 'Student Removed', description: `${student.name} has been removed from ${owner.hostelName}.` });
    } catch (error) {
      toast({ title: 'Delete Failed', description: error instanceof Error ? error.message : 'Unable to remove student.', variant: 'destructive' });
    }
  };

  const handleNotifyLeaving = async (student: OwnerStudent) => {
    if (!confirm(`Report ${student.name} as leaving the hostel? This creates a notification for owner review.`)) return;
    try {
      await requestJson(`/api/owner/${owner.id}/students/${student.id}/leaving-notify`, { method: 'POST' });
      toast({ title: 'Leaving Reported', description: `${student.name} leaving notification sent to owner.` });
    } catch (error) {
      toast({ title: 'Notify Failed', description: error instanceof Error ? error.message : 'Unable to create notification.', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingStudent) {
        const response = await requestJson<{ student: OwnerStudent }>(
          `/api/owners/${owner.id}/students/${editingStudent.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              ...form,
              userId: form.userId.trim() || undefined,
              roomId: form.roomId === 'unassigned' ? null : form.roomId,
            }),
          }
        );
        setStudents((current) =>
          current.map((student) => (student.id === editingStudent.id ? response.student : student))
        );
        toast({ title: 'Student Updated', description: `${response.student.name} profile updated.` });
      } else {
        const submittedPassword = form.password;
        const response = await requestJson<{ student: OwnerStudent }>(`/api/owners/${owner.id}/students`, {
          method: 'POST',
          body: JSON.stringify({
            ...form,
            userId: form.userId.trim() || undefined, // let server auto-generate if blank
            roomId: form.roomId === 'unassigned' ? null : form.roomId,
          }),
        });

        setStudents((current) => [response.student, ...current]);

        // Show credentials popup
        setCreatedCreds({
          name: response.student.name,
          userId: response.student.userId || form.userId,
          password: submittedPassword,
        });

        toast({ title: 'Student Added ✓', description: `${response.student.name} can now log in with their credentials.` });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: editingStudent ? 'Update Failed' : 'Add Failed',
        description: error instanceof Error ? error.message : 'Unable to save student.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: 'userId' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' });
    }
  };

  const exportData = () => {
    if (students.length === 0) {
      toast({ title: 'No Data', description: 'No students to export.', variant: 'destructive' });
      return;
    }
    const csvContent = [
      ['Name', 'User ID', 'Phone', 'College', 'Parent Contact', 'Address', 'Room Number'],
      ...students.map((student) => [
        student.name,
        student.userId,
        student.phone,
        student.college,
        student.parentContact,
        student.address,
        student.roomNumber ?? 'Unassigned',
      ]),
    ]
      .map((row) => row.map((value) => `"${value ?? ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${owner.hostelName.replace(/\s+/g, '-').toLowerCase()}-students.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export Complete', description: 'Student records exported to CSV.' });
  };

  return (
    <AuthGuard allowedRole="owner">
    <OwnerLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="gradient-text text-3xl font-bold">Student Records</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add students and share their User ID + password to let them log in to the student portal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportData} className="border-teal-500/30 text-teal-300 hover:bg-teal-500/10">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total Students', value: students.length, icon: Users, tint: 'from-teal-500/25 to-cyan-500/10' },
            { label: 'Portal Ready', value: students.length, icon: Link2, tint: 'from-amber-500/25 to-orange-500/10' },
            { label: 'Hostel Protected', value: owner.hostelName, icon: ShieldCheck, tint: 'from-sky-500/25 to-blue-500/10' },
          ].map((item) => (
            <Card key={item.label} className="glass card-3d-flat overflow-hidden">
              <CardContent className="relative p-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.tint}`} />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold">{item.value}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass overflow-hidden border-white/10">
          <CardContent className="p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, User ID, or college..."
                  className="input-dark pl-10"
                />
              </div>
              <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-4 py-3 text-xs text-muted-foreground">
                Students log in with their <strong className="text-teal-300">User ID</strong> + password.
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="glass">
            <CardContent className="flex items-center justify-center p-10">
              <div className="spinner h-8 w-8" />
            </CardContent>
          </Card>
        ) : students.length === 0 ? (
          <Card className="glass border-teal-500/30">
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                <Users className="h-10 w-10 text-teal-300" />
              </div>
              <h2 className="text-2xl font-bold">No Students Yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Add your first student — a unique User ID and password will be created that they can use to log into the student portal.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="glass card-3d h-full overflow-hidden border-white/10">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-teal-500/20">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold">{student.name}</h3>
                            <p className="truncate text-sm text-muted-foreground">{student.college || 'Hostel student'}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-teal-500/30 text-teal-300 shrink-0">
                          Linked
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 shrink-0 text-teal-400" />
                          <span className="truncate font-mono text-xs text-foreground/80">{student.userId || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{student.phone || 'No phone added'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 shrink-0" />
                          <span>{student.parentContact || 'No parent contact added'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                            {student.roomNumber ? `Room ${student.roomNumber}` : 'Room not assigned'}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-2.5 text-xs leading-5 text-muted-foreground">
                        Login ID: <span className="font-mono font-semibold text-teal-300">{student.userId}</span> → <span className="text-teal-300">{owner.hostelName}</span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(student)} className="text-teal-300 hover:bg-teal-500/10 hover:text-teal-200">
                          <Edit2 className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(student)} className="text-red-300 hover:bg-red-500/10 hover:text-red-200">
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleNotifyLeaving(student)} className="ml-auto text-orange-300 hover:bg-orange-500/10 hover:text-orange-200 text-xs px-3">
                          <LogOut className="mr-1 h-4 w-4" />
                          Leaving
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredStudents.length === 0 && students.length > 0 && (
          <div className="py-12 text-center text-muted-foreground">No students found matching your search.</div>
        )}
      </motion.div>

      {/* Add / Edit Student Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="glass max-w-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  placeholder="Alice Johnson"
                  className="input-dark"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Student User ID
                  <span className="ml-1 text-xs text-muted-foreground">(auto-generated if blank)</span>
                </Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={form.userId}
                    onChange={(e) => setForm((current) => ({ ...current, userId: e.target.value }))}
                    placeholder="e.g. alice101 or STU001"
                    className="input-dark pl-10 font-mono"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Password {editingStudent ? <span className="text-xs text-muted-foreground">(leave blank to keep)</span> : ''}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                    placeholder={editingStudent ? 'Keep existing password' : 'Set a password for student'}
                    className="input-dark pl-10 font-mono"
                    required={!editingStudent}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  className="input-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>College / University</Label>
              <Input
                value={form.college}
                onChange={(e) => setForm((current) => ({ ...current, college: e.target.value }))}
                placeholder="JNTU, Osmania, etc."
                className="input-dark"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Parent Contact</Label>
                <Input
                  value={form.parentContact}
                  onChange={(e) => setForm((current) => ({ ...current, parentContact: e.target.value }))}
                  placeholder="+91 9123456789"
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label>Home Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
                  placeholder="123 Main Street"
                  className="input-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign Room</Label>
              <Select
                value={form.roomId}
                onValueChange={(value) => setForm((current) => ({ ...current, roomId: value }))}
              >
                <SelectTrigger className="input-dark">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Keep unassigned</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.roomNumber} - Floor {room.floor} ({room.studentCount}/{room.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
              {editingStudent
                ? "Update the student's details. Password only changes if you enter a new one."
                : 'The Student User ID and password you set here become their hostel login credentials. Share these with the student after saving.'}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                {isSubmitting ? <div className="spinner h-5 w-5" /> : editingStudent ? 'Update Student' : 'Create Student Login'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Display Dialog — shown after creating a new student */}
      <Dialog open={!!createdCreds} onOpenChange={(open) => { if (!open) setCreatedCreds(null); }}>
        <DialogContent className="glass max-w-md border-teal-500/30">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
              Student Login Credentials
            </DialogTitle>
          </DialogHeader>

          {createdCreds && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share these credentials with <strong className="text-foreground">{createdCreds.name}</strong> so they can log into the student portal.
              </p>

              <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 divide-y divide-teal-500/20 overflow-hidden">
                {/* User ID */}
                <div className="flex items-center justify-between p-4 gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Student User ID</p>
                    <p className="font-mono text-lg font-bold text-teal-300 truncate">{createdCreds.userId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdCreds.userId, 'userId')}
                    className="shrink-0 p-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition-colors"
                    aria-label="Copy User ID"
                  >
                    {copiedField === 'userId' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password */}
                <div className="flex items-center justify-between p-4 gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Password</p>
                    <p className="font-mono text-lg font-bold text-cyan-300 truncate">{createdCreds.password}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdCreds.password, 'password')}
                    className="shrink-0 p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                    aria-label="Copy Password"
                  >
                    {copiedField === 'password' ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 leading-5">
                ⚠️ Save these credentials now. The password won&apos;t be shown again. The student visits the <strong>Student Portal</strong> on the homepage to log in.
              </div>

              <Button
                onClick={() => setCreatedCreds(null)}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                Done — Credentials Saved
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </OwnerLayout>
    </AuthGuard>
  );
}
