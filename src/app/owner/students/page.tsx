'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Edit2, Trash2, Search, Phone, Mail, 
  MapPin, School, User, DoorOpen, Download
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore, StudentData } from '@/lib/data-store';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function OwnerStudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType } = useAuthStore();
  const { students, rooms, addStudent, updateStudent, deleteStudent, updateRoom } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [address, setAddress] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!owner) return null;

  const availableRooms = rooms.filter(room => room.occupants.length < room.capacity);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomByStudent = (roomId: string | null) => {
    if (!roomId) return null;
    return rooms.find(r => r.id === roomId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData = {
      name,
      email,
      password: password || 'student123',
      phone,
      college,
      parentContact,
      address,
      roomId: selectedRoomId || null,
      ownerEmail: owner.email,
    };

    if (editingStudent) {
      // Update room assignments
      if (editingStudent.roomId !== selectedRoomId) {
        // Remove from old room
        if (editingStudent.roomId) {
          const oldRoom = rooms.find(r => r.id === editingStudent.roomId);
          if (oldRoom) {
            updateRoom(oldRoom.id, {
              occupants: oldRoom.occupants.filter(id => id !== editingStudent.id)
            });
          }
        }
        // Add to new room
        if (selectedRoomId) {
          const newRoom = rooms.find(r => r.id === selectedRoomId);
          if (newRoom && newRoom.occupants.length < newRoom.capacity) {
            updateRoom(newRoom.id, {
              occupants: [...newRoom.occupants, editingStudent.id]
            });
          }
        }
      }
      
      updateStudent(editingStudent.id, studentData);
      toast({
        title: 'Student Updated',
        description: `${name}'s record has been updated.`,
      });
    } else {
      // Check if email exists
      if (students.find(s => s.email === email)) {
        toast({
          title: 'Error',
          description: 'A student with this email already exists.',
          variant: 'destructive',
        });
        return;
      }

      const newStudentId = `student_${Date.now()}`;
      addStudent({
        id: newStudentId,
        ...studentData,
      });
      
      // Add to room
      if (selectedRoomId) {
        const room = rooms.find(r => r.id === selectedRoomId);
        if (room && room.occupants.length < room.capacity) {
          updateRoom(room.id, {
            occupants: [...room.occupants, newStudentId]
          });
        }
      }
      
      toast({
        title: 'Student Added',
        description: `${name} has been added successfully.`,
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (student: StudentData) => {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setPassword('');
    setPhone(student.phone);
    setCollege(student.college || '');
    setParentContact(student.parentContact || '');
    setAddress(student.address || '');
    setSelectedRoomId(student.roomId || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (student: StudentData) => {
    // Remove from room
    if (student.roomId) {
      const room = rooms.find(r => r.id === student.roomId);
      if (room) {
        updateRoom(room.id, {
          occupants: room.occupants.filter(id => id !== student.id)
        });
      }
    }
    
    deleteStudent(student.id);
    toast({
      title: 'Student Removed',
      description: `${student.name} has been removed from the hostel.`,
    });
  };

  const resetForm = () => {
    setEditingStudent(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setCollege('');
    setParentContact('');
    setAddress('');
    setSelectedRoomId('');
  };

  const exportData = () => {
    if (students.length === 0) {
      toast({
        title: 'No Data',
        description: 'No students to export.',
        variant: 'destructive',
      });
      return;
    }
    
    const csvContent = [
      ['Name', 'Email', 'Phone', 'College', 'Room', 'Parent Contact', 'Address'],
      ...students.map(s => [
        s.name,
        s.email,
        s.phone,
        s.college || '',
        getRoomByStudent(s.roomId)?.roomNumber || 'Not Assigned',
        s.parentContact || '',
        s.address || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'Student data has been exported to CSV.',
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
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Student Records</h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Manage all student/hosteler information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={exportData}
              className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 text-sm"
            >
              <Download className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-sm"
            >
              <Plus className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Add Student</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: 'Total Students', value: students.length, icon: Users, color: 'teal' },
            { label: 'With Room', value: students.filter(s => s.roomId).length, icon: DoorOpen, color: 'green' },
            { label: 'Without Room', value: students.filter(s => !s.roomId).length, icon: User, color: 'amber' },
            { label: 'Available Beds', value: rooms.reduce((acc, r) => acc + (r.capacity - r.occupants.length), 0), icon: DoorOpen, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-3 lg:p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    stat.color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                    stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                    stat.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-xl lg:text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or college..."
            className="pl-9 lg:pl-10 input-dark"
          />
        </div>

        {/* Empty State */}
        {students.length === 0 && (
          <Card className="glass border-teal-500/30">
            <CardContent className="p-6 lg:p-10 text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 lg:w-10 lg:h-10 text-teal-400" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold mb-2">No Students Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm lg:text-base">
                Add your first student to start managing their information, room assignments, and fees.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Student
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          <AnimatePresence>
            {filteredStudents.map((student, index) => {
              const room = getRoomByStudent(student.roomId);
              
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="glass hover:shadow-lg hover:shadow-teal-500/10 transition-all">
                    <CardContent className="p-4 lg:p-5">
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm lg:text-base truncate">{student.name}</h3>
                            <p className="text-xs lg:text-sm text-muted-foreground truncate">{student.college}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] lg:text-xs flex-shrink-0 ml-2 ${room ? 'border-teal-500/30 text-teal-400' : 'border-amber-500/30 text-amber-400'}`}>
                          {room ? `R${room.roomNumber}` : 'No Room'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                          <span className="truncate">{student.phone || 'No phone'}</span>
                        </div>
                        {student.parentContact && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                            <span className="truncate">Parent: {student.parentContact}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-border/30">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(student)}
                          className="flex-1 h-8 lg:h-9 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 text-xs lg:text-sm"
                        >
                          <Edit2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(student)}
                          className="flex-1 h-8 lg:h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs lg:text-sm"
                        >
                          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredStudents.length === 0 && students.length > 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No students found matching your search</p>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="glass max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text text-lg lg:text-xl">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Full Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alice Johnson"
                  className="input-dark"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@example.com"
                  className="input-dark"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Password {!editingStudent && '*'}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingStudent ? 'Leave blank to keep' : 'student123'}
                  className="input-dark"
                  required={!editingStudent}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 111 222 3333"
                  className="input-dark"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">College/University</Label>
              <Input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="MIT, Stanford, etc."
                className="input-dark"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Assign Room</Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger className="input-dark">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Room</SelectItem>
                  {availableRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.roomNumber} ({room.occupants.length}/{room.capacity} occupied)
                    </SelectItem>
                  ))}
                  {editingStudent?.roomId && !availableRooms.find(r => r.id === editingStudent.roomId) && (
                    <SelectItem value={editingStudent.roomId}>
                      Room {getRoomByStudent(editingStudent.roomId)?.roomNumber} (Current)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Parent Contact</Label>
              <Input
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="+1 999 888 7777"
                className="input-dark"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Home Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Home Street, City"
                className="input-dark"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsDialogOpen(false); resetForm(); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600"
              >
                {editingStudent ? 'Update' : 'Add'} Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}
