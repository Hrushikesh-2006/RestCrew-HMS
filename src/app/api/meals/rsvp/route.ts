export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { publishMealEvent } from '@/lib/meal-events';

export async function POST(request: Request) {
  try {
    const { mealId, studentId, willAttend } = await request.json();

    if (!mealId || !studentId) {
      return NextResponse.json({ error: 'Meal ID and Student ID are required.' }, { status: 400 });
    }

    const meal = await db.meal.findUnique({
      where: { id: mealId },
      select: { id: true, ownerId: true },
    });

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found.' }, { status: 404 });
    }

    const participation = await db.mealParticipation.upsert({
      where: {
        studentId_mealId: {
          studentId,
          mealId,
        },
      },
      update: {
        willAttend,
      },
      create: {
        studentId,
        mealId,
        willAttend,
      },
    });

    publishMealEvent({
      ownerId: meal.ownerId,
      action: 'rsvp-updated',
      mealId: meal.id,
    });

    return NextResponse.json({ participation });
  } catch (error) {
    console.error('RSVP API Error:', error);
    return NextResponse.json({ error: 'Unable to record RSVP.' }, { status: 500 });
  }
}
