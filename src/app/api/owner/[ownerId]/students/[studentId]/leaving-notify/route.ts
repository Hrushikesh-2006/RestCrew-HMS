export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/firebase-admin';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ownerId: string; studentId: string }> }
) {
  try {
    const session = await getServerSession(request);
    if (!session || session.userType !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ownerId, studentId } = await params;
    if (session.userId !== ownerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const student = await db.student.findUnique({
      where: { id: studentId, ownerId },
      select: { name: true, email: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const notification = await db.notification.create({
      data: {
        title: 'Student Leaving Request',
        message: `${student.name} (${student.email}) has reported they are leaving the hostel.`,
        type: 'student-leaving',
        ownerId,
        studentId,
        isRead: false,
      },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Checkout notify error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
