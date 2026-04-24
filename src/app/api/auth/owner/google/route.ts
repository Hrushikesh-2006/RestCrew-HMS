export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapOwnerAuth } from '@/lib/auth-mappers';
import { verifyFirebaseIdToken } from '@/lib/firebase-admin';
import { hashPassword } from '@/lib/password';

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

    let owner = await db.owner.findUnique({ where: { email } });

    if (!owner) {
      const displayName = decodedToken.name?.trim() || email.split('@')[0] || 'Owner';
      owner = await db.owner.create({
        data: {
          email,
          password: hashPassword(`google:${decodedToken.uid}`),
          name: displayName,
          hostelName: `${displayName}'s Hostel`,
          hostelAddress: 'Update your hostel address',
          phone: decodedToken.phone_number ?? null,
        },
      });
    }

    return NextResponse.json({ owner: mapOwnerAuth(owner) });
  } catch {
    return NextResponse.json({ error: 'Google sign-in failed for owner portal.' }, { status: 401 });
  }
}
