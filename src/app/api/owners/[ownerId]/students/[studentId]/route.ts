export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';

interface RouteContext {
  params: Promise<{ ownerId: string; studentId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { ownerId, studentId } = await context.params;
    const body = await request.json();

    const existingStudent = await db.student.findFirst({
      where: { id: studentId, ownerId },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found for this hostel.' }, { status: 404 });
    }

    const nextEmail = body?.email?.trim()?.toLowerCase();

    if (nextEmail && nextEmail !== existingStudent.email) {
      const duplicate = await db.student.findUnique({ where: { email: nextEmail } });
      if (duplicate) {
        return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 });
      }
    }

    const nextRoomId = typeof body?.roomId === 'string' && body.roomId.trim() ? body.roomId.trim() : null;

    if (nextRoomId) {
      const room = await db.room.findFirst({
        where: { id: nextRoomId, ownerId },
        include: { students: true },
      });

      if (!room) {
        return NextResponse.json({ error: 'Selected room was not found for this hostel.' }, { status: 404 });
      }

      const occupiedByOthers = room.students.filter((student) => student.id !== studentId).length;
      if (occupiedByOthers >= room.capacity) {
        return NextResponse.json({ error: 'Selected room is already full.' }, { status: 400 });
      }
    }

    const student = await db.student.update({
      where: { id: studentId },
      data: {
        name: body?.name?.trim() || existingStudent.name,
        email: nextEmail || existingStudent.email,
        password: body?.password?.trim() ? hashPassword(body.password.trim()) : existingStudent.password,
        phone: body?.phone?.trim() || null,
        college: body?.college?.trim() || null,
        parentContact: body?.parentContact?.trim() || null,
        address: body?.address?.trim() || null,
        roomId: nextRoomId,
      },
      include: { room: true },
    });

    return NextResponse.json({
      student: {
        id: student.id,
        email: student.email,
        password: '',
        name: student.name,
        phone: student.phone ?? '',
        college: student.college ?? '',
        parentContact: student.parentContact ?? '',
        address: student.address ?? '',
        roomId: student.roomId,
        roomNumber: student.room?.roomNumber,
        ownerId: student.ownerId,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to update student right now.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { ownerId, studentId } = await context.params;

    const existingStudent = await db.student.findFirst({
      where: { id: studentId, ownerId },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found for this hostel.' }, { status: 404 });
    }

    await db.$transaction([
      db.notification.deleteMany({
        where: {
          studentId,
          ownerId,
        },
      }),
      db.mealParticipation.deleteMany({
        where: { studentId },
      }),
      db.complaint.deleteMany({
        where: {
          studentId,
          ownerId,
        },
      }),
      db.fee.deleteMany({
        where: {
          studentId,
          ownerId,
        },
      }),
      db.student.delete({ where: { id: studentId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Owner Student Delete Error:', error);
    return NextResponse.json({ error: 'Unable to remove student right now.' }, { status: 500 });
  }
}
