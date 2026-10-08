import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthUser } from '../auth-user.js';

interface AuthenticatedRequest {
  user?: AuthUser | null;
}

@Injectable()
export class AdminOrInstructorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException(
        'Only admins and instructors can perform this action',
      );
    }

    return true;
  }
}
