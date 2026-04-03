import type { Owner, Student, Room } from '@prisma/client';

type StudentWithRelations = Student & {
  owner?: Owner;
  room?: Room | null;
};

export function mapOwnerAuth(owner: Owner) {
  return {
    id: owner.id,
    email: owner.email,
    name: owner.name,
    hostelName: owner.hostelName,
    hostelAddress: owner.hostelAddress,
    phone: owner.phone ?? '',
  };
}

export function mapStudentAuth(student: StudentWithRelations) {
  return {
    id: student.id,
    email: student.email,
    name: student.name,
    phone: student.phone ?? '',
    college: student.college ?? '',
    parentContact: student.parentContact ?? '',
    address: student.address ?? '',
    roomId: student.roomId ?? undefined,
    roomNumber: student.room?.roomNumber,
    ownerId: student.ownerId,
    hostelName: student.owner?.hostelName,
  };
}
