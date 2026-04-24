export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapOwnerAuth } from '@/lib/auth-mappers';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();
    const hostelName = body?.hostelName?.trim();
    const hostelAddress = body?.hostelAddress?.trim();
    const phone = body?.phone?.trim() || null;

    if (!name || !email || !password || !hostelName || !hostelAddress) {
      return NextResponse.json(
        { error: 'Name, email, password, hostel name, and hostel address are required.' },
        { status: 400 }
      );
    }

    const existingOwner = await db.owner.findUnique({ where: { email } });

    if (existingOwner) {
      return NextResponse.json({ error: 'An owner with this email already exists.' }, { status: 409 });
    }

    const owner = await db.owner.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        hostelName,
        hostelAddress,
        phone,
      },
    });

    return NextResponse.json({ owner: mapOwnerAuth(owner) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to register owner right now.' }, { status: 500 });
  }
}
