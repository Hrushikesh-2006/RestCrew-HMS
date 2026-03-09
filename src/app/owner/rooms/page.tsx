'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DoorOpen, Plus, Users, Edit2, Trash2, Grid, List, 
  Wifi, Wind, Bath, BookOpen, Sun, Check
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDataStore, Room } from '@/lib/data-store';
import { OwnerLayout } from '@/components/owner/owner-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const amenityOptions = [
  { id: 'WiFi', label: 'WiFi', icon: Wifi },
  { id: 'AC', label: 'Air Conditioning', icon: Wind },
  { id: 'Attached Bathroom', label: 'Attached Bathroom', icon: Bath },
  { id: 'Study Table', label: 'Study Table', icon: BookOpen },
  { id: 'Balcony', label: 'Balcony', icon: Sun },
];

export default function OwnerRoomsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { owner, isAuthenticated, userType } = useAuthStore();
  const { rooms, students, addRoom, updateRoom, deleteRoom } = useDataStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  // Form state
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [capacity, setCapacity] = useState('3');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || userType !== 'owner') {
      router.push('/owner/login');
    }
  }, [isAuthenticated, userType, router]);

  if (!owner) return null;

  const getRoomStatus = (room: Room) => {
    if (room.occupants.length === 0) return 'vacant';
    if (room.occupants.length >= room.capacity) return 'full';
    return 'occupied';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vacant': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'occupied': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'full': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStudentsInRoom = (roomId: string) => {
    return students.filter(s => s.roomId === roomId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const roomData = {
      roomNumber,
      floor: parseInt(floor),
      capacity: parseInt(capacity),
      amenities: selectedAmenities,
      occupants: editingRoom?.occupants || [],
    };

    if (editingRoom) {
      updateRoom(editingRoom.id, roomData);
      toast({
        title: 'Room Updated',
        description: `Room ${roomNumber} has been updated successfully.`,
      });
    } else {
      addRoom({
        id: `room_${Date.now()}`,
        ...roomData,
      });
      toast({
        title: 'Room Added',
        description: `Room ${roomNumber} has been added successfully.`,
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setFloor(room.floor.toString());
    setCapacity(room.capacity.toString());
    setSelectedAmenities(room.amenities);
    setIsDialogOpen(true);
  };

  const handleDelete = (room: Room) => {
    if (room.occupants.length > 0) {
      toast({
        title: 'Cannot Delete',
        description: 'Room has occupants. Please remove students first.',
        variant: 'destructive',
      });
      return;
    }
    deleteRoom(room.id);
    toast({
      title: 'Room Deleted',
      description: `Room ${room.roomNumber} has been deleted.`,
    });
  };

  const resetForm = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setFloor('1');
    setCapacity('3');
    setSelectedAmenities([]);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

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
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Room Management</h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Manage your hostel rooms and track occupancy
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center glass rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-teal-500/20 text-teal-400' : 'text-muted-foreground'
                }`}
              >
                <Grid className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-teal-500/20 text-teal-400' : 'text-muted-foreground'
                }`}
              >
                <List className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
            
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Room</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: 'Total Rooms', value: rooms.length, color: 'teal' },
            { label: 'Vacant', value: rooms.filter(r => getRoomStatus(r) === 'vacant').length, color: 'green' },
            { label: 'Partially Occupied', value: rooms.filter(r => getRoomStatus(r) === 'occupied').length, color: 'amber' },
            { label: 'Full', value: rooms.filter(r => getRoomStatus(r) === 'full').length, color: 'red' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass">
                <CardContent className="p-3 lg:p-4">
                  <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-xl lg:text-3xl font-bold mt-1 ${
                    stat.color === 'teal' ? 'text-teal-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'amber' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {rooms.length === 0 && (
          <Card className="glass border-teal-500/30">
            <CardContent className="p-6 lg:p-10 text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <DoorOpen className="w-8 h-8 lg:w-10 lg:h-10 text-teal-400" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold mb-2">No Rooms Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm lg:text-base">
                Start by adding your hostel rooms. You can set capacity (3/4/5 sharing) and amenities for each room.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Room
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Room Grid/List by Floor */}
        {Object.entries(roomsByFloor).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, floorRooms]) => (
          <motion.div
            key={floor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 lg:w-5 lg:h-5 text-teal-400" />
              Floor {floor}
            </h2>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
                <AnimatePresence>
                  {floorRooms.map((room, index) => {
                    const status = getRoomStatus(room);
                    
                    return (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className={`relative rounded-xl lg:rounded-2xl p-3 lg:p-4 cursor-pointer transition-all room-cell ${status}`}
                      >
                        <div className="flex items-center justify-between mb-2 lg:mb-3">
                          <span className="text-base lg:text-lg font-bold">{room.roomNumber}</span>
                          <Badge variant="outline" className={`text-[10px] lg:text-xs ${getStatusColor(status)}`}>
                            {room.capacity}-share
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          <Users className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
                          <span className="text-xs lg:text-sm text-muted-foreground">
                            {room.occupants.length}/{room.capacity}
                          </span>
                        </div>
                        
                        {/* Occupancy Dots */}
                        <div className="flex gap-1 mb-2 lg:mb-3">
                          {Array.from({ length: room.capacity }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${
                                i < room.occupants.length 
                                  ? status === 'full' ? 'bg-red-400' : 'bg-amber-400'
                                  : 'bg-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Amenities */}
                        <div className="flex flex-wrap gap-1 mb-2 lg:mb-3">
                          {room.amenities.slice(0, 2).map(amenity => (
                            <span
                              key={amenity}
                              className="text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 rounded-full bg-slate-700/50 text-muted-foreground"
                            >
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 2 && (
                            <span className="text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 rounded-full bg-slate-700/50 text-muted-foreground">
                              +{room.amenities.length - 2}
                            </span>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border/30">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleEdit(room); }}
                            className="flex-1 h-7 lg:h-8 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleDelete(room); }}
                            className="flex-1 h-7 lg:h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <Card className="glass overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Room</th>
                        <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Capacity</th>
                        <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Occupants</th>
                        <th className="text-left p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Status</th>
                        <th className="text-right p-3 lg:p-4 text-xs lg:text-sm text-muted-foreground font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {floorRooms.map((room) => {
                        const status = getRoomStatus(room);
                        
                        return (
                          <motion.tr
                            key={room.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border/20 hover:bg-slate-800/30"
                          >
                            <td className="p-3 lg:p-4">
                              <span className="font-medium text-sm lg:text-base">{room.roomNumber}</span>
                            </td>
                            <td className="p-3 lg:p-4 text-sm">{room.capacity}-sharing</td>
                            <td className="p-3 lg:p-4">
                              <span className="flex items-center gap-1 text-sm">
                                <Users className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
                                {room.occupants.length}/{room.capacity}
                              </span>
                            </td>
                            <td className="p-3 lg:p-4">
                              <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                                {status}
                              </Badge>
                            </td>
                            <td className="p-3 lg:p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(room)}
                                  className="h-8 w-8 p-0 text-teal-400 hover:text-teal-300"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(room)}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="glass max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text text-lg lg:text-xl">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Room Number</Label>
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="101"
                  className="input-dark"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Floor</Label>
                <Select value={floor} onValueChange={setFloor}>
                  <SelectTrigger className="input-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Floor 1</SelectItem>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                    <SelectItem value="4">Floor 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Room Capacity (Sharing)</Label>
              <Select value={capacity} onValueChange={setCapacity}>
                <SelectTrigger className="input-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Sharing</SelectItem>
                  <SelectItem value="4">4 Sharing</SelectItem>
                  <SelectItem value="5">5 Sharing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm transition-all ${
                      selectedAmenities.includes(amenity.id)
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'bg-slate-700/50 text-muted-foreground border border-transparent hover:border-border'
                    }`}
                  >
                    {selectedAmenities.includes(amenity.id) && <Check className="w-3 h-3" />}
                    {amenity.label}
                  </button>
                ))}
              </div>
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
                {editingRoom ? 'Update' : 'Add'} Room
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OwnerLayout>
  );
}
