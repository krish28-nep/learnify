import { Module } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { SubjectsController } from './subjects.controller.js';
import { SubjectsRepository } from './subjects.repository.js';
import { SubjectsService } from './subjects.service.js';

@Module({
  controllers: [SubjectsController],
  providers: [AdminGuard, SubjectsRepository, SubjectsService],
})
export class SubjectsModule {}
