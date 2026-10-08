import { Module } from '@nestjs/common';
import { AdminOrInstructorGuard } from '../auth/guards/admin-or-instructor.guard.js';
import { UnitsController } from './units.controller.js';
import { UnitsRepository } from './units.repository.js';
import { UnitsService } from './units.service.js';

@Module({
  controllers: [UnitsController],
  providers: [AdminOrInstructorGuard, UnitsRepository, UnitsService],
})
export class UnitsModule {}
