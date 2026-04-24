import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany()
  const owners = await prisma.owner.findMany()
  console.log("Students:", JSON.stringify(students.map(s => ({n:s.name, e:s.email})), null, 2))
  console.log("Owners:", JSON.stringify(owners.map(o => ({n:o.name, e:o.email})), null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
