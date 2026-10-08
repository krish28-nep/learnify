import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  type SessionRecord,
} from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import type { AuthUser } from './auth-user.js';

@Injectable()
export class SessionAuthProvider extends SessionCookieProvider<AuthUser> {
  constructor(
    private readonly usersService: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  protected validate(session: SessionRecord): Promise<AuthUser | null> {
    return this.usersService.findById(session.userId);
  }
}
