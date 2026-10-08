import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    AuthenticationModule.forRoot({
      session: {
        absoluteTtl: '14d',
        idleTtl: '3d',
        trustedOrigins: [process.env['WEB_URL'] ?? 'http://localhost:3000'],
      },
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
