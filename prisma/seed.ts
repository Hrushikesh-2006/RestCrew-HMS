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
          roomNumber: '101' as string,
          floor: 1,
          capacity: 3,
          amenities: JSON.stringify(['AC', 'Attached Bathroom', 'WiFi', 'Study Table']) as string,
          ownerId: owner.id as string,
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

  // Create a sample student for seed data (complaints, etc. require a student)
  const student = await prisma.student.create({
    data: {
      email: 'student@example.com',
      password: 'student123',
      name: 'Sample Student',
      ownerId: owner.id,
      roomId: rooms[0].id,
    },
  });

  console.log('Created sample student:', student.email);

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

  const meals: Awaited<ReturnType<typeof prisma.meal.create>>[] = [];
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

  // Note: Meal participations will be created when students register and participate
  console.log('Skipping meal participations - will be created by students');

  // Create Sample Complaints (without student references)
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
        studentId: student.id,
        ownerId: owner.id,
      },
    });
  }

  console.log('Created', complaints.length, 'complaints');

  // Note: Fees will be created when students are registered and fees are assigned
  console.log('Skipping fee creation - fees will be created by owners for registered students');

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
  console.log(`- Students: 0 (will be created by owners through the app)`);
  console.log(`- Meals: ${meals.length}`);
  console.log(`- Complaints: ${complaints.length}`);
  console.log('\n📝 Student accounts will be created by hostel owners through the application interface.');
  console.log('No sample student data is included to maintain privacy and security.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
