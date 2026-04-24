export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ownerId, name, hostelName, phone } = body;

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID is required.' }, { status: 400 });
    }

    const updatedOwner = await db.owner.update({
      where: { id: ownerId },
      data: {
        name,
        hostelName,
        phone,
      },
    });

    return NextResponse.json({
      owner: {
        id: updatedOwner.id,
        email: updatedOwner.email,
        name: updatedOwner.name,
        hostelName: updatedOwner.hostelName,
        hostelAddress: updatedOwner.hostelAddress,
        phone: updatedOwner.phone,
      },
    });
  } catch (error) {
    console.error('Failed to update owner profile:', error);
    return NextResponse.json({ error: 'Unable to update profile.' }, { status: 500 });
  }
}
