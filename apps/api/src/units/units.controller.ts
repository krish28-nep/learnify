import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '../common/pagination.js';
import {
  createUnitSchema,
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
  async findBySubjectId(
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Query({ schema: paginationQuerySchema }) pagination: PaginationQuery,
  ) {
    const { items, metadata } = await this.unitsService.findBySubjectId(
      subjectId,
      pagination,
    );
    return {
      message: 'Units retrieved successfully',
      units: items,
      ...(metadata ? { metadata } : {}),
    };
  }

  @Post('subjects/:subjectId/units')
  @UseGuards(AdminGuard)
  async create(
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Body({ schema: createUnitSchema }) body: CreateUnitDto,
  ) {
    return {
      message: 'Unit created successfully',
      unit: await this.unitsService.create(subjectId, body),
    };
  }

  @Get('units/:id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return {
      message: 'Unit retrieved successfully',
      unit: await this.unitsService.findById(id),
    };
  }

  @Patch('units/:id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: updateUnitSchema }) body: UpdateUnitDto,
  ) {
    return {
      message: 'Unit updated successfully',
      unit: await this.unitsService.update(id, body),
    };
  }

  @Delete('units/:id')
  @UseGuards(AdminGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.unitsService.delete(id);
    return { message: 'Unit deleted successfully' };
  }
}
