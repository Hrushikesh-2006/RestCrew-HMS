export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';

interface RouteContext {
  params: Promise<{ ownerId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { ownerId } = await context.params;
    const owner = await db.owner.findUnique({
      where: { id: ownerId },
      select: { id: true },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Hostel owner was not found.' }, { status: 404 });
    }

    const students = await db.student.findMany({
      where: { ownerId },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      students: students.map((student) => ({
        id: student.id,
        userId: student.userId ?? '',
        email: student.email ?? '',
        password: '',
        name: student.name,
        phone: student.phone ?? '',
        college: student.college ?? '',
        parentContact: student.parentContact ?? '',
        address: student.address ?? '',
        roomId: student.roomId,
        roomNumber: student.room?.roomNumber,
        ownerId: student.ownerId,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load hostel students.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { ownerId } = await context.params;
    const body = await request.json();
    const name = body?.name?.trim();
    let userId = (body?.userId || body?.studentId)?.trim();
    const email = body?.email?.trim()?.toLowerCase() || null;
    const password = body?.password?.trim();

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required.' }, { status: 400 });
    }

    // Auto-generate userId if not provided by owner
    if (!userId) {
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 5);
      userId = `${sanitizedName || 'stu'}${Math.floor(100 + Math.random() * 900)}`;
    }

    const owner = await db.owner.findUnique({
      where: { id: ownerId },
      select: { id: true, hostelName: true },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Hostel owner was not found.' }, { status: 404 });
    }

    // Check unique userId
    const existingUserId = await db.student.findFirst({
      where: {
        OR: [
          { userId },
          { userId: userId.toLowerCase() },
        ],
      },
    });

    if (existingUserId) {
      return NextResponse.json({ error: `User ID "${userId}" is already assigned to another student. Please enter a different User ID.` }, { status: 409 });
    }

    // If email provided, check uniqueness
    if (email) {
      const existingEmail = await db.student.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 });
      }
    }

    const roomId = typeof body?.roomId === 'string' && body.roomId.trim() ? body.roomId.trim() : null;

    if (roomId) {
      const room = await db.room.findFirst({
        where: { id: roomId, ownerId },
        include: { students: true },
      });

      if (!room) {
        return NextResponse.json({ error: 'Selected room was not found for this hostel.' }, { status: 404 });
      }

      if (room.students.length >= room.capacity) {
        return NextResponse.json({ error: 'Selected room is already full.' }, { status: 400 });
      }
    }

    const student = await db.student.create({
      data: {
        userId,
        name,
        email,
        password: hashPassword(password),
        phone: body?.phone?.trim() || null,
        college: body?.college?.trim() || null,
        parentContact: body?.parentContact?.trim() || null,
        address: body?.address?.trim() || null,
        roomId,
        ownerId: owner.id,
      },
      include: { room: true },
    });

    return NextResponse.json(
      {
        student: {
          id: student.id,
          userId: student.userId ?? userId,
          email: student.email ?? '',
          password: '',
          name: student.name,
          phone: student.phone ?? '',
          college: student.college ?? '',
          parentContact: student.parentContact ?? '',
          address: student.address ?? '',
          roomId: student.roomId,
          roomNumber: student.room?.roomNumber,
          ownerId: student.ownerId,
          hostelName: owner.hostelName,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create student error:', err);
    return NextResponse.json({ error: 'Unable to add student right now.' }, { status: 500 });
  }
}
