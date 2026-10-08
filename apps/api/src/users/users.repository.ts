import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/auth-user.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<AuthUser> {
    const user = await this.prisma.user.create({
      data: { name: name.trim(), email: normalizeEmail(email), passwordHash },
    });
    return toAuthUser(user);
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toAuthUser(user) : null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
    return user ? toAuthUser(user) : null;
  }

  async findCredentials(
    email: string,
  ): Promise<{ user: AuthUser; passwordHash: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
    return user
      ? { user: toAuthUser(user), passwordHash: user.passwordHash }
      : null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}

function normalizeEmail(email: string): string {
  return email.trim().normalize('NFC').toLowerCase();
}

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role: AuthUser['role'];
}): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
