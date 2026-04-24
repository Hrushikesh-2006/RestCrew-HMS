const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const owners = await prisma.owner.findMany();
  console.log('Owners:', owners.length);
  
  const rooms = await prisma.room.findMany();
  console.log('Rooms:', rooms.length);
  
  const students = await prisma.student.findMany();
  console.log('Students:', students.length);
  
  const meals = await prisma.meal.findMany();
  console.log('Meals:', meals.length, meals);

  console.log('--- ALL STUDENTS ---');
  console.log(students);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
