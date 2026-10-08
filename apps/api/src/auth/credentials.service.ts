import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import type { AuthUser } from './auth-user.js';
import type { SignInType } from './auth.schemas.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthUser> {
    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.passwordHasher.hash(password);
    return this.usersService.create(name, email, passwordHash);
  }

  async verify(data: SignInType): Promise<AuthUser | null> {
    const found = await this.usersService.findCredentials(data.email);
    const valid = await this.passwordHasher.verify(
      data.password,
      found?.passwordHash,
    );
    if (!valid || !found) {
      return null;
    }

    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      const passwordHash = await this.passwordHasher.hash(data.password);
      await this.usersService.updatePasswordHash(found.user.id, passwordHash);
    }

    return found.user;
  }
}
