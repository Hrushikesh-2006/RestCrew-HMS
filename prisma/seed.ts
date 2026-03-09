import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.mealParticipation.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.student.deleteMany();
  await prisma.room.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.owner.deleteMany();

  // Create Owner
  const owner = await prisma.owner.create({
    data: {
      email: 'owner@restcrew.com',
      password: 'owner123', // In production, this would be hashed
      name: 'Rajesh Kumar',
      hostelName: 'RestCrew Premium Hostel',
      hostelAddress: '123 University Road, Tech Park, Bangalore - 560001',
      phone: '+91 98765 43210',
    },
  });

  console.log('Created owner:', owner.email);

  // Create Rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        roomNumber: '101',
        floor: 1,
        capacity: 3,
        amenities: JSON.stringify(['AC', 'Attached Bathroom', 'WiFi', 'Study Table']),
        ownerId: owner.id,
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '102',
        floor: 1,
        capacity: 4,
        amenities: JSON.stringify(['Attached Bathroom', 'WiFi', 'Study Table', 'Balcony']),
        ownerId: owner.id,
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '103',
        floor: 1,
        capacity: 3,
        amenities: JSON.stringify(['AC', 'Attached Bathroom', 'WiFi']),
        ownerId: owner.id,
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '201',
        floor: 2,
        capacity: 4,
        amenities: JSON.stringify(['Attached Bathroom', 'WiFi', 'Study Table']),
        ownerId: owner.id,
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '202',
        floor: 2,
        capacity: 5,
        amenities: JSON.stringify(['WiFi', 'Common Bathroom']),
        ownerId: owner.id,
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '203',
        floor: 2,
        capacity: 3,
        amenities: JSON.stringify(['AC', 'Attached Bathroom', 'WiFi', 'Mini Fridge']),
        ownerId: owner.id,
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '301',
        floor: 3,
        capacity: 4,
        amenities: JSON.stringify(['Attached Bathroom', 'WiFi', 'Study Table', 'Balcony']),
        ownerId: owner.id,
      },
    }),
    prisma.room.create({
      data: {
        roomNumber: '302',
        floor: 3,
        capacity: 5,
        amenities: JSON.stringify(['WiFi', 'Common Bathroom']),
        ownerId: owner.id,
      },
    }),
  ]);

  console.log('Created', rooms.length, 'rooms');

  // Create Students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        email: 'rahul.sharma@student.com',
        password: 'student123',
        name: 'Rahul Sharma',
        phone: '+91 98765 11111',
        college: 'IIT Bangalore',
        parentContact: '+91 98765 11112',
        address: '45 MG Road, Delhi - 110001',
        roomId: rooms[0].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'priya.patel@student.com',
        password: 'student123',
        name: 'Priya Patel',
        phone: '+91 98765 22222',
        college: 'NIT Karnataka',
        parentContact: '+91 98765 22223',
        address: '78 Brigade Road, Mumbai - 400001',
        roomId: rooms[0].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'arjun.reddy@student.com',
        password: 'student123',
        name: 'Arjun Reddy',
        phone: '+91 98765 33333',
        college: 'BITS Pilani',
        parentContact: '+91 98765 33334',
        address: '12 Park Street, Hyderabad - 500001',
        roomId: rooms[0].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'sneha.gupta@student.com',
        password: 'student123',
        name: 'Sneha Gupta',
        phone: '+91 98765 44444',
        college: 'IIM Bangalore',
        parentContact: '+91 98765 44445',
        address: '23 Church Street, Chennai - 600001',
        roomId: rooms[1].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'vikram.singh@student.com',
        password: 'student123',
        name: 'Vikram Singh',
        phone: '+91 98765 55555',
        college: 'Delhi University',
        parentContact: '+91 98765 55556',
        address: '56 Connaught Place, Delhi - 110001',
        roomId: rooms[1].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'ananya.roy@student.com',
        password: 'student123',
        name: 'Ananya Roy',
        phone: '+91 98765 66666',
        college: 'Jadavpur University',
        parentContact: '+91 98765 66667',
        address: '89 Park Avenue, Kolkata - 700001',
        roomId: rooms[1].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'karan.mehta@student.com',
        password: 'student123',
        name: 'Karan Mehta',
        phone: '+91 98765 77777',
        college: 'VIT Vellore',
        parentContact: '+91 98765 77778',
        address: '34 Residency Road, Ahmedabad - 380001',
        roomId: rooms[1].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'divya.nair@student.com',
        password: 'student123',
        name: 'Divya Nair',
        phone: '+91 98765 88888',
        college: 'Anna University',
        parentContact: '+91 98765 88889',
        address: '67 Marine Drive, Kochi - 682001',
        roomId: rooms[2].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'rohit.verma@student.com',
        password: 'student123',
        name: 'Rohit Verma',
        phone: '+91 98765 99999',
        college: 'Pune University',
        parentContact: '+91 98765 99990',
        address: '90 FC Road, Pune - 411001',
        roomId: rooms[2].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'meera.iyer@student.com',
        password: 'student123',
        name: 'Meera Iyer',
        phone: '+91 98765 00001',
        college: 'IISC Bangalore',
        parentContact: '+91 98765 00002',
        address: '12 Cathedral Road, Chennai - 600001',
        roomId: rooms[3].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'aditya.joshi@student.com',
        password: 'student123',
        name: 'Aditya Joshi',
        phone: '+91 98765 00003',
        college: 'IIT Madras',
        parentContact: '+91 98765 00004',
        address: '45 Mount Road, Indore - 452001',
        roomId: rooms[3].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'kavita.sharma@student.com',
        password: 'student123',
        name: 'Kavita Sharma',
        phone: '+91 98765 00005',
        college: 'IIT Delhi',
        parentContact: '+91 98765 00006',
        address: '78 Ring Road, Jaipur - 302001',
        roomId: rooms[4].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'suresh.kumar@student.com',
        password: 'student123',
        name: 'Suresh Kumar',
        phone: '+91 98765 00007',
        college: 'NIT Trichy',
        parentContact: '+91 98765 00008',
        address: '23 Gandhi Road, Madurai - 625001',
        roomId: rooms[4].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'neha.kapoor@student.com',
        password: 'student123',
        name: 'Neha Kapoor',
        phone: '+91 98765 00009',
        college: 'IIM Calcutta',
        parentContact: '+91 98765 00010',
        address: '56 Camac Street, Lucknow - 226001',
        roomId: rooms[5].id,
        ownerId: owner.id,
      },
    }),
    prisma.student.create({
      data: {
        email: 'amit.yadav@student.com',
        password: 'student123',
        name: 'Amit Yadav',
        phone: '+91 98765 00011',
        college: 'IIIT Hyderabad',
        parentContact: '+91 98765 00012',
        address: '89 Banjara Hills, Patna - 800001',
        roomId: rooms[6].id,
        ownerId: owner.id,
      },
    }),
  ]);

  console.log('Created', students.length, 'students');

  // Create Meals for current week
  const today = new Date();
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const mealMenus = {
    breakfast: [
      JSON.stringify(['Poha', 'Upma', 'Tea', 'Coffee', 'Milk', 'Bread Butter', 'Fruits']),
      JSON.stringify(['Idli Sambar', 'Chutney', 'Tea', 'Coffee', 'Milk', 'Banana']),
      JSON.stringify(['Paratha', 'Curd', 'Pickle', 'Tea', 'Coffee', 'Juice']),
      JSON.stringify(['Puri Bhaji', 'Tea', 'Coffee', 'Milk', 'Fruits']),
      JSON.stringify(['Dosa', 'Sambar', 'Chutney', 'Tea', 'Coffee']),
      JSON.stringify(['Bread Omelette', 'Toast', 'Tea', 'Coffee', 'Juice']),
      JSON.stringify(['Aloo Paratha', 'Curd', 'Butter', 'Tea', 'Coffee', 'Fruits']),
    ],
    lunch: [
      JSON.stringify(['Rice', 'Dal', 'Sabzi', 'Roti', 'Salad', 'Buttermilk']),
      JSON.stringify(['Rice', 'Sambar', 'Rasam', 'Roti', 'Papad', 'Curd Rice']),
      JSON.stringify(['Jeera Rice', 'Dal Fry', 'Paneer Butter Masala', 'Roti', 'Salad']),
      JSON.stringify(['Lemon Rice', 'Curd Rice', 'Roti', 'Mixed Veg', 'Pickle']),
      JSON.stringify(['Rice', 'Dal Tadka', 'Aloo Gobi', 'Roti', 'Raita']),
      JSON.stringify(['Veg Biryani', 'Raita', 'Roti', 'Salad', 'Papad']),
      JSON.stringify(['Rice', 'Sambar', 'Avial', 'Roti', 'Pickle', 'Buttermilk']),
    ],
    dinner: [
      JSON.stringify(['Roti', 'Paneer Masala', 'Rice', 'Dal', 'Salad']),
      JSON.stringify(['Roti', 'Chole', 'Rice', 'Raita', 'Papad']),
      JSON.stringify(['Pulao', 'Dal', 'Roti', 'Mixed Veg', 'Curd']),
      JSON.stringify(['Roti', 'Veg Korma', 'Rice', 'Sambar', 'Pickle']),
      JSON.stringify(['Khichdi', 'Kadhi', 'Roti', 'Papad', 'Salad']),
      JSON.stringify(['Roti', 'Palak Paneer', 'Rice', 'Dal', 'Raita']),
      JSON.stringify(['Fried Rice', 'Manchurian', 'Roti', 'Soup', 'Salad']),
    ],
  };

  const meals: any[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);

    for (const type of mealTypes) {
      const meal = await prisma.meal.create({
        data: {
          date,
          type,
          menu: mealMenus[type as keyof typeof mealMenus][i % 7],
          timing: type === 'breakfast' ? '7:00 AM - 9:00 AM' : type === 'lunch' ? '12:00 PM - 2:00 PM' : '7:00 PM - 9:00 PM',
          ownerId: owner.id,
        },
      });
      meals.push(meal);
    }
  }

  console.log('Created', meals.length, 'meals');

  // Create Meal Participations (random)
  for (const student of students) {
    for (const meal of meals.slice(0, 9)) { // First 3 days
      await prisma.mealParticipation.create({
        data: {
          studentId: student.id,
          mealId: meal.id,
          willAttend: Math.random() > 0.3,
        },
      });
    }
  }

  console.log('Created meal participations');

  // Create Complaints
  const complaints = [
    { category: 'Food', title: 'Food Quality Issue', description: 'The dal served yesterday was not cooked properly and had a raw taste.', status: 'Open' },
    { category: 'Electricity', title: 'Power fluctuation', description: 'There is frequent power fluctuation in room 102. It affects my studies.', status: 'Pending' },
    { category: 'WiFi', title: 'Slow Internet Speed', description: 'WiFi speed is very slow during evening hours. Unable to attend online classes.', status: 'Open' },
    { category: 'Cleaning', title: 'Room not cleaned', description: 'My room has not been cleaned for the past 3 days.', status: 'Resolved', notes: 'Cleaning staff has been assigned and the room is now clean.' },
    { category: 'Water', title: 'Low water pressure', description: 'Water pressure in the bathroom is very low during morning hours.', status: 'Pending' },
    { category: 'Room Issues', title: 'AC not working', description: 'The AC in my room (103) stopped working since yesterday.', status: 'Open' },
    { category: 'Washing Machine', title: 'Washing machine broken', description: 'One of the washing machines on the ground floor is not working.', status: 'Resolved', notes: 'Machine has been repaired and is now functional.' },
    { category: 'Food', title: 'Late breakfast service', description: 'Breakfast is often served late, causing students to miss their classes.', status: 'Open' },
    { category: 'Electricity', title: 'Faulty switch', description: 'The light switch in my room (201) is sparking and seems dangerous.', status: 'Resolved', notes: 'Electrician fixed the switch. Safety inspection completed.' },
    { category: 'Other', title: 'Noise complaint', description: 'Loud music is played late night in room 202, disturbing sleep.', status: 'Pending' },
  ];

  for (let i = 0; i < complaints.length; i++) {
    const complaint = complaints[i];
    await prisma.complaint.create({
      data: {
        category: complaint.category,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        notes: complaint.notes,
        studentId: students[i % students.length].id,
        ownerId: owner.id,
      },
    });
  }

  console.log('Created', complaints.length, 'complaints');

  // Create Fees
  const feeMonths = ['January 2025', 'February 2025', 'March 2025', 'April 2025'];
  const feeAmounts = [6500, 5500, 7500, 5000]; // Different room types have different fees

  for (const student of students) {
    const roomIndex = rooms.findIndex(r => r.id === student.roomId);
    const feeAmount = feeAmounts[roomIndex % feeAmounts.length];

    for (let i = 0; i < feeMonths.length; i++) {
      const dueDate = new Date(2025, i, 5); // 5th of each month
      const status = i < 2 ? 'Paid' : (i === 2 ? 'Pending' : 'Overdue');
      const paidDate = status === 'Paid' ? new Date(2025, i, 3) : null;

      await prisma.fee.create({
        data: {
          amount: feeAmount,
          dueDate,
          status,
          paidDate,
          month: feeMonths[i],
          studentId: student.id,
          ownerId: owner.id,
        },
      });
    }
  }

  console.log('Created fees for all students');

  // Create Expenses
  const expenseCategories = ['Electricity', 'Water', 'Food', 'Maintenance', 'Staff', 'Other'];
  const expenseDescriptions = [
    'Monthly electricity bill',
    'Water supply charges',
    'Groceries and vegetables',
    'AC repair and maintenance',
    'Staff salaries',
    'Miscellaneous expenses',
    'Internet bill',
    'Security services',
    'Pest control',
    'Plumbing repairs',
  ];

  for (let month = 0; month < 4; month++) {
    for (let i = 0; i < 10; i++) {
      const date = new Date(2025, month, Math.floor(Math.random() * 28) + 1);
      await prisma.expense.create({
        data: {
          category: expenseCategories[i % expenseCategories.length],
          description: expenseDescriptions[i],
          amount: Math.floor(Math.random() * 20000) + 5000,
          date,
          ownerId: owner.id,
        },
      });
    }
  }

  console.log('Created expenses');

  // Create Investments
  const investments = [
    { description: 'New furniture for rooms', amount: 150000, date: new Date(2025, 0, 15) },
    { description: 'Solar panel installation', amount: 300000, date: new Date(2025, 1, 10) },
    { description: 'Kitchen equipment upgrade', amount: 75000, date: new Date(2025, 2, 5) },
    { description: 'CCTV security system', amount: 120000, date: new Date(2025, 2, 20) },
  ];

  for (const inv of investments) {
    await prisma.investment.create({
      data: {
        description: inv.description,
        amount: inv.amount,
        date: inv.date,
        ownerId: owner.id,
      },
    });
  }

  console.log('Created investments');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Owner: ${owner.email} (password: owner123)`);
  console.log(`- Rooms: ${rooms.length}`);
  console.log(`- Students: ${students.length}`);
  console.log(`- Meals: ${meals.length}`);
  console.log(`- Complaints: ${complaints.length}`);
  console.log('\n📝 Sample Student Login:');
  console.log(`- Email: ${students[0].email}`);
  console.log('- Password: student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
