import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.task.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { in: ['admin@primetrade.ai', 'demo@primetrade.ai'] } },
  });

  const adminPassword = await bcrypt.hash('Admin123', 12);
  const userPassword = await bcrypt.hash('User1234', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@primetrade.ai', username: 'admin', password: adminPassword, role: 'ADMIN' },
  });

  const user = await prisma.user.create({
    data: { email: 'demo@primetrade.ai', username: 'demouser', password: userPassword, role: 'USER' },
  });

  const tasks = [
    { title: 'Set up project infrastructure', status: 'COMPLETED' as const, userId: admin.id, createdBy: admin.username },
    { title: 'Design database schema', status: 'COMPLETED' as const, userId: admin.id, createdBy: admin.username },
    { title: 'Implement authentication', status: 'IN_PROGRESS' as const, userId: user.id, createdBy: user.username },
    { title: 'Build task management API', status: 'IN_PROGRESS' as const, userId: user.id, createdBy: user.username },
    { title: 'Write API documentation', status: 'PENDING' as const, userId: user.id, createdBy: user.username },
    { title: 'Deploy to production', status: 'PENDING' as const, userId: admin.id, createdBy: admin.username },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('Seed complete!');
  console.log('  Admin: admin@primetrade.ai / Admin123');
  console.log('  User:  demo@primetrade.ai / User1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
