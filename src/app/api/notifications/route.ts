export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { publishMealEvent } from '@/lib/meal-events';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentIds, ownerId, type, title, message } = body;

    if (!studentIds || !Array.isArray(studentIds) || !ownerId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required notification fields.' }, { status: 400 });
    }

    // Create notifications for all specified students in a transaction
    const notifications = await db.$transaction(
      studentIds.map((studentId: string) =>
        db.notification.create({
          data: {
            studentId,
            ownerId,
            type,
            title,
            message,
          },
        })
      )
    );

    if (type === 'Meal') {
      publishMealEvent({ ownerId, action: 'notification-created' });
    }

    return NextResponse.json({ success: true, count: notifications.length });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ error: 'Unable to create notifications.' }, { status: 500 });
  }
}
