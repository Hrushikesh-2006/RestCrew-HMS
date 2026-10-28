export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapStudentAuth } from '@/lib/auth-mappers';
import { verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body?.userId || body?.identifier || body?.email)?.trim();
    const password = body?.password?.trim();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Student ID and password are required.' }, { status: 400 });
    }

    // Find student by either User ID or Email
    const student = await db.student.findFirst({
      where: {
        OR: [
          { userId: identifier },
          { userId: identifier.toLowerCase() },
          { email: identifier.toLowerCase() },
        ],
      },
      include: { owner: true, room: true },
    });

    if (!student || !verifyPassword(password, student.password)) {
      return NextResponse.json({ error: 'Invalid Student ID or password.' }, { status: 401 });
    }

    return NextResponse.json({ student: mapStudentAuth(student) });
  } catch {
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
