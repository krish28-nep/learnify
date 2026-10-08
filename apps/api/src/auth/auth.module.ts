import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { CredentialsService } from './credentials.service.js';
import { SessionAuthProvider } from './session-auth.provider.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [CredentialsService, SessionAuthProvider],
})
export class AuthModule {}
