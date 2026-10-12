import { Module } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { UnitsController } from './units.controller.js';
import { UnitsRepository } from './units.repository.js';
import { UnitsService } from './units.service.js';

@Module({
  controllers: [UnitsController],
  providers: [AdminGuard, UnitsRepository, UnitsService],
})
export class UnitsModule {}
