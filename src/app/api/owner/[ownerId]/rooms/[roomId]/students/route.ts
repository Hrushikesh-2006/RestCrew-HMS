export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ ownerId: string; roomId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { ownerId, roomId } = await context.params;

    const room = await db.room.findUnique({
      where: { id: roomId },
      include: {
        students: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!room || room.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      students: room.students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone ?? null,
        college: student.college ?? null
      }))
    });
  } catch (error) {
    console.error('[ROOM_STUDENTS_GET]', error);
    return NextResponse.json({ error: 'Unable to load room students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { ownerId, roomId } = await context.params;
    const body = await request.json();
    const studentIds = Array.isArray(body.studentIds) ? body.studentIds : [body.studentIds];

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs required' }, { status: 400 });
    }

    // Get room
    const room = await db.room.findUnique({
      where: { id: roomId },
      include: { students: true }
    });

    if (!room || room.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check capacity
    if (room.students.length + studentIds.length > room.capacity) {
      return NextResponse.json(
        { error: `Room capacity exceeded. Current: ${room.students.length}/${room.capacity}` },
        { status: 400 }
      );
    }

    // Verify students exist and unassigned
    const students = await db.student.findMany({
      where: {
        id: { in: studentIds },
        ownerId,
        roomId: null // Only unassigned students
      }
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students not found or already assigned to rooms' },
        { status: 400 }
      );
    }

    // Assign students
    await db.student.updateMany({
      where: { id: { in: studentIds } },
      data: { roomId }
    });

    // Emit room assignment events
    for (const studentId of studentIds) {
      const { publishRoomEvent } = await import('@/lib/room-events');
      publishRoomEvent({
        ownerId,
        action: 'assigned',
        studentId,
        roomId,
      });
    }

    return NextResponse.json({
      success: true,
      assigned: students.length,
      message: `${students.length} students assigned to room ${room.roomNumber}`
    });

  } catch (error) {
    console.error('[ROOM_ASSIGN_POST]', error);
    return NextResponse.json({ error: 'Unable to assign students' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { ownerId, roomId } = await context.params;
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const student = await db.student.findFirst({
      where: {
        id: studentId,
        ownerId,
        roomId
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found in this room' }, { status: 404 });
    }

    await db.student.update({
      where: { id: studentId },
      data: { roomId: null }
    });

    // Emit room unassignment event
    const { publishRoomEvent } = await import('@/lib/room-events');
    publishRoomEvent({
      ownerId,
      action: 'unassigned',
      studentId,
    });

    const room = await db.room.findUnique({
      where: { id: roomId },
      select: { roomNumber: true }
    });

    return NextResponse.json({
      success: true,
      message: `Student removed from room ${room?.roomNumber}`
    });

  } catch (error) {
    console.error('[ROOM_UNASSIGN_DELETE]', error);
    return NextResponse.json({ error: 'Unable to unassign student' }, { status: 500 });
  }
}

