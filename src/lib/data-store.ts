'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  amenities: string[];
  occupants: string[];
}

export interface StudentData {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  college: string;
  parentContact: string;
  address: string;
  roomId: string | null;
  ownerEmail: string;
}

export interface OwnerData {
  id: string;
  email: string;
  password: string;
  name: string;
  hostelName: string;
  hostelAddress: string;
  phone: string;
}

export interface Meal {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  menu: string[];
  timing: string;
  ownerEmail: string;
}

export interface MealParticipation {
  id: string;
  studentId: string;
  mealId: string;
  willAttend: boolean;
}

export type ComplaintCategory = 'Food' | 'Electricity' | 'Washing Machine' | 'WiFi' | 'Cleaning' | 'Water' | 'Room Issues' | 'Other';
export type ComplaintStatus = 'Open' | 'Pending' | 'Resolved';

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  notes: string;
  studentId: string;
  studentName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export type FeeStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Fee {
  id: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidDate: string | null;
  month: string;
  studentId: string;
  studentName: string;
  ownerEmail: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  ownerEmail: string;
}

export interface Investment {
  id: string;
  description: string;
  amount: number;
  date: string;
  ownerEmail: string;
}

export interface Reminder {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  feeId: string;
  amount: number;
  dueDate: string;
  sent: boolean;
  sentAt: string | null;
  ownerEmail: string;
  message?: string;
}

interface DataStore {
  owners: OwnerData[];
  students: StudentData[];
  rooms: Room[];
  meals: Meal[];
  mealParticipations: MealParticipation[];
  complaints: Complaint[];
  fees: Fee[];
  expenses: Expense[];
  investments: Investment[];
  reminders: Reminder[];
  
  lastAutomatedReminderDate: string | null;
  
  addOwner: (owner: OwnerData) => void;
  updateOwnerData: (email: string, data: Partial<OwnerData>) => void;
  addStudent: (student: StudentData) => void;
  updateStudent: (id: string, data: Partial<StudentData>) => void;
  deleteStudent: (id: string) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addMeal: (meal: Meal) => void;
  updateMeal: (id: string, data: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  setMealParticipation: (data: MealParticipation) => void;
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, data: Partial<Complaint>) => void;
  addFee: (fee: Fee) => void;
  updateFee: (id: string, data: Partial<Fee>) => void;
  updateFeeStatuses: () => void;
  addExpense: (expense: Expense) => void;
  addInvestment: (investment: Investment) => void;
  addReminder: (reminder: Reminder) => void;
  setLastAutomatedReminderDate: (date: string) => void;
  addReminderToAllActiveStudents: (ownerEmail: string, reminderData: { amount: number; dueDate: string }) => void;
  addNotificationToAllStudents: (ownerEmail: string, message: { title: string; description: string }) => void;
  clearAllData: () => void;
}

export const generateId = (prefix?: string) => {
  const id = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}_${id}` : id;
};

// Empty initial state - ALL data must be entered manually
const emptyState = {
  owners: [],
  students: [],
  rooms: [],
  meals: [],
  mealParticipations: [],
  complaints: [],
  fees: [],
  expenses: [],
  investments: [],
  reminders: [],
  lastAutomatedReminderDate: null,
};

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      ...emptyState,
      
      addOwner: (owner) => set((state) => ({ owners: [...state.owners, owner] })),
      
      updateOwnerData: (email, data) => set((state) => ({
        owners: state.owners.map(o => o.email === email ? { ...o, ...data } : o)
      })),
      
      addStudent: (student) => set((state) => ({ students: [...state.students, student] })),
      
      updateStudent: (id, data) => set((state) => ({
        students: state.students.map(s => s.id === id ? { ...s, ...data } : s)
      })),
      
      deleteStudent: (id) => set((state) => ({
        students: state.students.filter(s => s.id !== id),
        rooms: state.rooms.map(r => ({
          ...r,
          occupants: r.occupants.filter(o => o !== id)
        }))
      })),
      
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      
      updateRoom: (id, data) => set((state) => ({
        rooms: state.rooms.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      
      deleteRoom: (id) => set((state) => ({ rooms: state.rooms.filter(r => r.id !== id) })),
      
      addMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
      
      updateMeal: (id, data) => set((state) => ({
        meals: state.meals.map(m => m.id === id ? { ...m, ...data } : m)
      })),
      
      deleteMeal: (id) => set((state) => ({ meals: state.meals.filter(m => m.id !== id) })),
      
      setMealParticipation: (data) => set((state) => {
        const existing = state.mealParticipations.findIndex(
          mp => mp.studentId === data.studentId && mp.mealId === data.mealId
        );
        if (existing >= 0) {
          const updated = [...state.mealParticipations];
          updated[existing] = data;
          return { mealParticipations: updated };
        }
        return { mealParticipations: [...state.mealParticipations, data] };
      }),
      
      addComplaint: (complaint) => set((state) => ({ complaints: [...state.complaints, complaint] })),
      
      updateComplaint: (id, data) => set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      
      addFee: (fee) => set((state) => ({ fees: [...state.fees, fee] })),
      
      updateFee: (id, data) => set((state) => ({
        fees: state.fees.map(f => f.id === id ? { ...f, ...data } : f)
      })),

      updateFeeStatuses: () => set((state) => {
        const now = new Date().toISOString().split('T')[0];
        const updatedFees = state.fees.map(fee => {
          if (fee.status === 'Pending' && fee.dueDate < now) {
            return { ...fee, status: 'Overdue' as FeeStatus };
          }
          return fee;
        });
        return { fees: updatedFees };
      }),

      addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
      
      addInvestment: (investment) => set((state) => ({ investments: [...state.investments, investment] })),
      
      addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
      
      setLastAutomatedReminderDate: (date) => set({ lastAutomatedReminderDate: date }),
      
      addReminderToAllActiveStudents: (ownerEmail, reminderData) => set((state) => {
        const newReminders: Reminder[] = state.students
          .filter(s => s.ownerEmail === ownerEmail)
          .map(student => ({
            id: generateId('rem'),
            studentId: student.id,
            studentEmail: student.email,
            studentName: student.name,
            feeId: 'bulk',
            amount: reminderData.amount,
            dueDate: reminderData.dueDate,
            sent: true,
            sentAt: new Date().toISOString(),
            ownerEmail,
          }));
        return { reminders: [...state.reminders, ...newReminders] };
      }),
      
      addNotificationToAllStudents: (ownerEmail, message) => set((state) => {
        const newReminders: Reminder[] = state.students
          .filter(s => s.ownerEmail === ownerEmail)
          .map(student => ({
            id: generateId('notif'),
            studentId: student.id,
            studentEmail: student.email,
            studentName: student.name,
            feeId: 'notification',
            amount: 0,
            dueDate: new Date().toISOString().split('T')[0],
            sent: true,
            sentAt: new Date().toISOString(),
            ownerEmail,
            message: message.description, // I'll add this field to Reminder or just use amount=0 to signal it's a notification
          }));
        return { reminders: [...state.reminders, ...newReminders] };
      }),
      
      clearAllData: () => set(emptyState),
    }),
    {
      name: 'restcrew-data-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        owners: state.owners,
        students: state.students,
        rooms: state.rooms,
        meals: state.meals,
        mealParticipations: state.mealParticipations,
        complaints: state.complaints,
        fees: state.fees,
        expenses: state.expenses,
        investments: state.investments,
        reminders: state.reminders,
        lastAutomatedReminderDate: state.lastAutomatedReminderDate,
      }),
    }
  )
);
