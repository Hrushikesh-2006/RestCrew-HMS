export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ ownerId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { ownerId } = await context.params;

    const students = await db.student.findMany({
      where: { 
        ownerId,
        roomId: null 
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true
      }
    });

    return NextResponse.json({
      students: students.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone ?? null,
        college: s.college ?? null
      }))
    });
  } catch (error) {
    console.error('[UNASSIGNED_STUDENTS_GET]', error);
    return NextResponse.json({ error: 'Unable to load unassigned students' }, { status: 500 });
  }
}

