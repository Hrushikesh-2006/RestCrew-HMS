import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ studentId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { studentId } = await context.params;

    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        owner: true,
        room: true,
        fees: { orderBy: { dueDate: 'desc' } },
        complaints: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone ?? '',
        college: student.college ?? '',
        hostelName: student.owner.hostelName,
      },
      room: student.room
        ? {
            id: student.room.id,
            roomNumber: student.room.roomNumber,
            floor: student.room.floor,
            capacity: student.room.capacity,
          }
        : null,
      fees: student.fees,
      complaints: student.complaints,
      meals: [],
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load student dashboard.' }, { status: 500 });
  }
}
