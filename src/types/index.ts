export interface ApiStudent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
}

export interface ApiRoom {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  amenities: string[] | null;
  studentCount: number;
  occupancy: string;
  status: 'vacant' | 'occupied' | 'full';
  students?: ApiStudent[];
  occupants?: string[];
}

export interface RoomWithStudents {
  id: string;
  roomNumber: string;
  capacity: number;
  students: ApiStudent[];
}

