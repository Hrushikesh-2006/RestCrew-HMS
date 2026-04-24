export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  compareMealsByDateAndType,
  formatDateInput,
  parseDateInput,
  serializeStudentMeal,
} from '@/lib/meal-utils';

interface RouteContext {
  params: Promise<{ studentId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { studentId } = await context.params;

    const studentWithRelations = await db.student.findUnique({
      where: { id: studentId },
      include: {
        owner: true,
        room: true,
        fees: { orderBy: { dueDate: 'desc' }, take: 10 },
        complaints: { orderBy: { createdAt: 'desc' }, take: 10 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!studentWithRelations) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // Fetch meals for the next 24 hours
    const today = parseDateInput(formatDateInput(new Date()));

    if (!today) {
      return NextResponse.json({ error: 'Unable to resolve the current date.' }, { status: 500 });
    }
    
    const meals = await db.meal.findMany({
      where: {
        ownerId: studentWithRelations.ownerId,
        date: {
          gte: today,
        },
      },
      include: {
        participations: {
          where: { studentId },
        },
      },
      orderBy: { date: 'asc' },
      take: 6,
    });

    return NextResponse.json({
      student: {
        id: studentWithRelations.id,
        name: studentWithRelations.name,
        email: studentWithRelations.email,
        phone: studentWithRelations.phone ?? '',
        college: studentWithRelations.college ?? '',
        hostelName: studentWithRelations.owner.hostelName,
      },
      room: studentWithRelations.room
        ? {
            id: studentWithRelations.room.id,
            roomNumber: studentWithRelations.room.roomNumber,
            floor: studentWithRelations.room.floor,
            capacity: studentWithRelations.room.capacity,
          }
        : null,
      fees: studentWithRelations.fees,
      complaints: studentWithRelations.complaints,
      notifications: studentWithRelations.notifications,
      meals: meals.sort(compareMealsByDateAndType).map(serializeStudentMeal),
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Unable to load student dashboard.' }, { status: 500 });
  }
}
