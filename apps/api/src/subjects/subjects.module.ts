import { Module } from '@nestjs/common';
import { AdminOrInstructorGuard } from '../auth/guards/admin-or-instructor.guard.js';
import { SubjectsController } from './subjects.controller.js';
import { SubjectsRepository } from './subjects.repository.js';
import { SubjectsService } from './subjects.service.js';

@Module({
  controllers: [SubjectsController],
  providers: [AdminOrInstructorGuard, SubjectsRepository, SubjectsService],
})
export class SubjectsModule {}
