import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ ownerId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { ownerId } = await context.params;

    const [students, rooms, complaints, fees] = await Promise.all([
      db.student.findMany({ where: { ownerId } }),
      db.room.findMany({ where: { ownerId } }),
      db.complaint.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      db.fee.findMany({ where: { ownerId } }),
    ]);

    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const occupiedBeds = students.filter((student) => student.roomId).length;

    return NextResponse.json({
      totalStudents: students.length,
      totalRooms: rooms.length,
      totalCapacity,
      occupiedBeds,
      openComplaints: complaints.filter((complaint) => complaint.status === 'Open').length,
      pendingComplaints: complaints.filter((complaint) => complaint.status === 'Pending').length,
      recentComplaints: complaints,
      paidFees: fees.filter((fee) => fee.status === 'Paid').reduce((sum, fee) => sum + fee.amount, 0),
      pendingFees: fees.filter((fee) => fee.status === 'Pending').reduce((sum, fee) => sum + fee.amount, 0),
      overdueFees: fees.filter((fee) => fee.status === 'Overdue').reduce((sum, fee) => sum + fee.amount, 0),
      paidFeeCount: fees.filter((fee) => fee.status === 'Paid').length,
      pendingFeeCount: fees.filter((fee) => fee.status === 'Pending').length,
      overdueFeeCount: fees.filter((fee) => fee.status === 'Overdue').length,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load owner summary.' }, { status: 500 });
  }
}
