import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOrInstructorGuard } from '../auth/guards/admin-or-instructor.guard.js';
import {
  createUnitSchema,
  unitIdSchema,
  unitSubjectIdSchema,
  updateUnitSchema,
  type CreateUnitDto,
  type UpdateUnitDto,
} from './unit.schemas.js';
import { UnitsService } from './units.service.js';

@ApiTags('Units')
@Controller()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get('subjects/:subjectId/units')
  findBySubjectId(
    @Param('subjectId', { schema: unitSubjectIdSchema }) subjectId: string,
  ) {
    return this.unitsService.findBySubjectId(subjectId);
  }

  @Post('subjects/:subjectId/units')
  @UseGuards(AdminOrInstructorGuard)
  create(
    @Param('subjectId', { schema: unitSubjectIdSchema }) subjectId: string,
    @Body({ schema: createUnitSchema }) body: CreateUnitDto,
  ) {
    return this.unitsService.create(subjectId, body);
  }

  @Get('units/:id')
  findById(@Param('id', { schema: unitIdSchema }) id: string) {
    return this.unitsService.findById(id);
  }

  @Patch('units/:id')
  @UseGuards(AdminOrInstructorGuard)
  update(
    @Param('id', { schema: unitIdSchema }) id: string,
    @Body({ schema: updateUnitSchema }) body: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, body);
  }

  @Delete('units/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminOrInstructorGuard)
  async delete(
    @Param('id', { schema: unitIdSchema }) id: string,
  ): Promise<void> {
    await this.unitsService.delete(id);
  }
}
