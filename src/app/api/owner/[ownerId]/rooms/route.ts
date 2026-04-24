export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ ownerId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { ownerId } = await context.params;

    const rooms = await db.room.findMany({
      where: { ownerId },
      include: {
        students: true
      },
      orderBy: { 
        floor: 'asc' 
      },
    });

    return NextResponse.json({
      rooms: rooms.map(room => ({
        ...room,
        studentCount: room.students.length,
        occupancy: `${room.students.length}/${room.capacity}`,
        status: room.students.length === 0 ? 'vacant' : 
                room.students.length >= room.capacity ? 'full' : 'occupied'
      }))
    });
  } catch (error) {
    console.error('[ROOMS_GET]', error);
    return NextResponse.json({ error: 'Unable to load rooms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { ownerId } = await context.params;
    const body = await request.json();

    const { roomNumber, floor, capacity, amenities = [] } = body;

    if (!roomNumber?.trim() || !floor || !capacity) {
      return NextResponse.json(
        { error: 'Room number, floor, and capacity are required' },
        { status: 400 }
      );
    }

    const existingRoom = await db.room.findFirst({
      where: { 
        roomNumber: roomNumber.trim(),
        ownerId
      }
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room number already exists for this hostel' },
        { status: 409 }
      );
    }

    const room = await db.room.create({
      data: {
        roomNumber: roomNumber.trim(),
        floor: Number(floor),
        capacity: Number(capacity),
        amenities: amenities.length ? amenities.join(', ') : null,
        ownerId,
      },
      include: {
        students: true
      }
    });

    return NextResponse.json(
      { 
        room: {
          id: room.id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          capacity: room.capacity,
          amenities: room.amenities ? room.amenities.split(', ') : [],
          studentCount: 0,
          occupancy: '0/' + room.capacity,
          status: 'vacant'
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ROOMS_POST]', error);
    return NextResponse.json({ error: 'Unable to create room' }, { status: 500 });
  }
}

