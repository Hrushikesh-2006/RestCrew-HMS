'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Owner {
  id: string;
  email: string;
  name: string;
  hostelName: string;
  hostelAddress: string;
  phone?: string;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  phone?: string;
  college?: string;
  parentContact?: string;
  address?: string;
  roomId?: string;
  roomNumber?: string;
  ownerId?: string;
  hostelName?: string;
}

interface AuthState {
  owner: Owner | null;
  student: Student | null;
  isAuthenticated: boolean;
  userType: 'owner' | 'student' | null;
  
  loginOwner: (owner: Owner) => void;
  loginStudent: (student: Student) => void;
  logout: () => void;
  updateStudentRoom: (roomId: string | undefined, roomNumber: string | undefined) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      owner: null,
      student: null,
      isAuthenticated: false,
      userType: null,
      
      loginOwner: (owner) => set({
        owner,
        student: null,
        isAuthenticated: true,
        userType: 'owner',
      }),
      
      loginStudent: (student) => set({
        owner: null,
        student,
        isAuthenticated: true,
        userType: 'student',
      }),
      
      logout: () => set({
        owner: null,
        student: null,
        isAuthenticated: false,
        userType: null,
      }),
      
      updateStudentRoom: (roomId, roomNumber) => set((state) => ({
        student: state.student ? {
          ...state.student,
          roomId,
          roomNumber,
        } : null,
      })),
    }),
    {
      name: 'restcrew-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        owner: state.owner,
        student: state.student,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
      }),
    }
  )
);
