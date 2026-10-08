import { Module } from '@nestjs/common';
import { AdminOrInstructorGuard } from '../auth/guards/admin-or-instructor.guard.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { ContentsController } from './contents.controller.js';
import { ContentsRepository } from './contents.repository.js';
import { ContentsService } from './contents.service.js';

@Module({
  imports: [UploadsModule],
  controllers: [ContentsController],
  providers: [AdminOrInstructorGuard, ContentsRepository, ContentsService],
})
export class ContentsModule {}
