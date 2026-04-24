'use client';

import { useEffect } from 'react';
import { useDataStore } from '@/lib/data-store';
import { useAuthStore } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';

export function AutomatedReminders() {
  const { 
    updateFeeStatuses, 
    lastAutomatedReminderDate, 
    setLastAutomatedReminderDate,
    addReminderToAllActiveStudents,
  } = useDataStore();
  const { owner } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    // 1. Run overdue status check daily
    updateFeeStatuses();

    // 2. Run monthly fee reminder on the 1st
    const now = new Date();
    const dayOfMonth = now.getDate();
    const currentMonthYear = `${now.getMonth() + 1}-${now.getFullYear()}`;

    // If it's the 1st of the month AND we haven't sent a reminder yet this month
    if (dayOfMonth === 1 && lastAutomatedReminderDate !== currentMonthYear) {
      if (owner?.email) {
        // Find an average fee amount or use a default
        const defaultAmount = 5000;
        const nextMonthDate = new Date();
        nextMonthDate.setDate(10); // Due by the 10th

        addReminderToAllActiveStudents(owner.email, {
          amount: defaultAmount,
          dueDate: nextMonthDate.toISOString().split('T')[0],
        });

        setLastAutomatedReminderDate(currentMonthYear);
        
        toast({
          title: "Monthly Reminders Sent",
          description: "An automated fee reminder has been sent to all students for the new month.",
        });
      }
    }
  }, [
    updateFeeStatuses, 
    lastAutomatedReminderDate, 
    setLastAutomatedReminderDate, 
    addReminderToAllActiveStudents, 
    owner,
    toast
  ]);

  return null; // This component doesn't render anything
}
