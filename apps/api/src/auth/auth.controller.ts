import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentUser, Public, SignInService } from '@nestjs/authentication';
import type { AuthUser } from './auth-user.js';
import { CredentialsService } from './credentials.service.js';
import {
  registerSchema,
  signInSchema,
  type RegisterDto,
  type SignInType,
} from './auth.schemas.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentials: CredentialsService,
    private readonly signInService: SignInService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body({ schema: registerSchema }) body: RegisterDto) {
    const user = await this.credentials.register(
      body.name,
      body.email,
      body.password,
    );
    await this.signInService.signIn(user.id, { method: 'password' });
    return { message: 'Registration successful', user };
  }

  @Public()
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body({ schema: signInSchema }) data: SignInType) {
    const user = await this.credentials.verify(data);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { session } = await this.signInService.signIn(user.id, {
      method: 'password',
    });
    return {
      message: 'Sign-in successful',
      mfaRequired: session.mfa === 'pending',
    };
  }

  @Public()
  @Post('sign-out')
  @HttpCode(200)
  async signOut() {
    await this.signInService.signOut();
    return { message: 'Sign-out successful' };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
