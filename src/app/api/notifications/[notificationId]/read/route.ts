export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ notificationId: string }>;
}

export async function PATCH(_: Request, context: RouteContext) {
  try {
    const { notificationId } = await context.params;

    const notification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json({ error: 'Unable to update notification.' }, { status: 500 });
  }
}
