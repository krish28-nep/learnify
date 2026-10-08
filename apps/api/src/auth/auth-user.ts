import type { User as PrismaUser } from '../generated/prisma/client.js';

export type AuthUser = Pick<PrismaUser, 'id' | 'name' | 'email' | 'role'>;

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: AuthUser;
  }
}
