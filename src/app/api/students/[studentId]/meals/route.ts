export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  compareMealsByDateAndType,
  formatDateInput,
  getUtcWeekRange,
  serializeStudentMeal,
} from '@/lib/meal-utils';

interface RouteContext {
  params: Promise<{ studentId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { studentId } = await context.params;
    const { searchParams } = new URL(request.url);
    const requestedDate = searchParams.get('date') ?? formatDateInput(new Date());

    const weekRange = getUtcWeekRange(requestedDate);

    if (!weekRange) {
      return NextResponse.json({ error: 'A valid date is required.' }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { ownerId: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const meals = await db.meal.findMany({
      where: {
        ownerId: student.ownerId,
        date: {
          gte: weekRange.start,
          lte: weekRange.end,
        },
      },
      include: {
        participations: {
          where: { studentId },
          select: { willAttend: true },
        },
      },
    });

    return NextResponse.json({
      meals: meals.sort(compareMealsByDateAndType).map(serializeStudentMeal),
    });
  } catch (error) {
    console.error('Student Meals API Error:', error);
    return NextResponse.json({ error: 'Unable to load meals.' }, { status: 500 });
  }
}
