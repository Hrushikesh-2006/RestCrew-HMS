import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapStudentAuth } from '@/lib/auth-mappers';
import { verifyFirebaseIdToken } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json({ error: 'Firebase ID token is required.' }, { status: 400 });
    }

    const decodedToken = await verifyFirebaseIdToken(idToken);
    const email = decodedToken.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Google account email is unavailable.' }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { email },
      include: { owner: true, room: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'This Google account is not linked to a hostel student yet. Ask the owner to add you first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student: mapStudentAuth(student) });
  } catch {
    return NextResponse.json({ error: 'Google sign-in failed for student portal.' }, { status: 401 });
  }
}
