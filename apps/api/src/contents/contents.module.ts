import { Module } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { ContentsController } from './contents.controller.js';
import { ContentsRepository } from './contents.repository.js';
import { ContentsService } from './contents.service.js';

@Module({
  imports: [CloudinaryModule],
  controllers: [ContentsController],
  providers: [AdminGuard, ContentsRepository, ContentsService],
})
export class ContentsModule {}
