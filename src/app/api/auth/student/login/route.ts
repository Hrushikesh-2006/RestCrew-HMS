export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapStudentAuth } from '@/lib/auth-mappers';
import { verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { email },
      include: { owner: true, room: true },
    });

    if (!student || !verifyPassword(password, student.password)) {
      return NextResponse.json({ error: 'Invalid student email or password.' }, { status: 401 });
    }

    return NextResponse.json({ student: mapStudentAuth(student) });
  } catch {
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
