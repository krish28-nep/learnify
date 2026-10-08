import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { UnitsModule } from './units/units.module.js';
import { ContentsModule } from './contents/contents.module.js';

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
    SubjectsModule,
    UnitsModule,
    ContentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
