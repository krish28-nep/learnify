import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import type { AuthUser } from '../auth/auth-user.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<AuthUser> {
    try {
      return await this.usersRepository.create(name, email, passwordHash);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  findById(id: string): Promise<AuthUser | null> {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string): Promise<AuthUser | null> {
    return this.usersRepository.findByEmail(email);
  }

  findCredentials(email: string) {
    return this.usersRepository.findCredentials(email);
  }

  updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    return this.usersRepository.updatePasswordHash(id, passwordHash);
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}
