import 'dotenv/config';
import { PasswordHasher } from '@nestjs/authentication';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const adminSeedSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(8).max(128),
});

async function main() {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed the admin account');
  }

  const parsedAdmin = adminSeedSchema.safeParse({
    name: process.env['ADMIN_NAME'],
    email: process.env['ADMIN_EMAIL'],
    password: process.env['ADMIN_PASSWORD'],
  });
  if (!parsedAdmin.success) {
    throw new Error(
      `Invalid admin seed configuration: ${parsedAdmin.error.issues.map((issue) => issue.path.join('.') + ' ' + issue.message).join('; ')}`,
    );
  }

  const { name, email, password } = parsedAdmin.data;
  const passwordHash = await new PasswordHasher().hash(password);
  const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

  try {
    console.info(`Seeding admin account for ${email}...`);
    const admin = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role: 'ADMIN' },
      create: { name, email, passwordHash, role: 'ADMIN' },
      select: { email: true },
    });
    console.info(`Admin seed complete for ${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Admin seed failed:', error);
  process.exitCode = 1;
});
