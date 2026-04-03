import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapOwnerAuth } from '@/lib/auth-mappers';
import { verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const owner = await db.owner.findUnique({ where: { email } });

    if (!owner || !verifyPassword(password, owner.password)) {
      return NextResponse.json({ error: 'Invalid owner email or password.' }, { status: 401 });
    }

    return NextResponse.json({ owner: mapOwnerAuth(owner) });
  } catch {
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
