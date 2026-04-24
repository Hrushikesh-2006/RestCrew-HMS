'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface RoomAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomNumber: string;
  capacity: number;
  currentOccupancy: number;
  onAssign: (studentIds: string[]) => Promise<void>;
  students: Student[];
}

export function RoomAssignmentModal({
  open,
  onOpenChange,
  roomNumber,
  capacity,
  currentOccupancy,
  onAssign,
  students,
}: RoomAssignmentModalProps) {
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  );

  const availableSlots = capacity - currentOccupancy;

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast({ title: 'No students selected', variant: 'destructive' });
      return;
    }

    if (selectedStudents.length > availableSlots) {
      toast({ 
        title: `Cannot assign ${selectedStudents.length} students`,
        description: `Only ${availableSlots} slots available`,
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      await onAssign(selectedStudents);
      setSelectedStudents([]);
      onOpenChange(false);
      toast({ title: `Assigned ${selectedStudents.length} students to ${roomNumber}` });
    } catch {
      toast({ 
        title: 'Failed to assign students', 
        description: 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSelectedStudents([]);
      setSearch('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Students to Room {roomNumber}</DialogTitle>
          <DialogDescription>
            {currentOccupancy}/{capacity} occupied. {availableSlots} slots available.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    'w-full justify-between font-normal h-10',
                    selectedStudents.length > 0 && 'bg-teal-500/20 border-teal-500/30 text-teal-400'
                  )}
                >
                  {selectedStudents.length > 0 
                    ? `${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''} selected`
                    : 'Select students...'
                  }
                  <ChevronDownIcon className="w-4 h-4 ml-2 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 max-h-[300px]">
                <Command>
                  <CommandInput 
                    placeholder="Search students..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No students found.</CommandEmpty>
                    <CommandGroup>
                      {filteredStudents.map(student => (
                        <CommandItem
                          key={student.id}
                          onSelect={() => {
                            if (selectedStudents.includes(student.id)) {
                              setSelectedStudents(prev => prev.filter(id => id !== student.id));
                            } else {
                              setSelectedStudents(prev => [...prev, student.id]);
                            }
                          }}
                        >
                          <div className="mr-2 flex items-center">
                            <CheckIcon className={cn(
                              'mr-2 h-4 w-4',
                              selectedStudents.includes(student.id) ? 'opacity-100' : 'opacity-0'
                            )} />
                          </div>
                          <div>
                            <div>{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedStudents.length > availableSlots && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              Cannot assign more than {availableSlots} students
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || selectedStudents.length === 0 || selectedStudents.length > availableSlots}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Assign {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

