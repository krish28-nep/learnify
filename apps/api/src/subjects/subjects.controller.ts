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
import {
  createSubjectSchema,
  updateSubjectSchema,
  type CreateSubjectDto,
  type UpdateSubjectDto,
} from './subject.schemas.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '../common/pagination.js';
import { SubjectsService } from './subjects.service.js';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  async findAll(
    @Query({ schema: paginationQuerySchema }) pagination: PaginationQuery,
  ) {
    const { items, metadata } = await this.subjectsService.findAll(pagination);
    return {
      message: 'Subjects retrieved successfully',
      subjects: items,
      ...(metadata ? { metadata } : {}),
    };
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return {
      message: 'Subject retrieved successfully',
      subject: await this.subjectsService.findById(id),
    };
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body({ schema: createSubjectSchema }) body: CreateSubjectDto) {
    return {
      message: 'Subject created successfully',
      subject: await this.subjectsService.create(body),
    };
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: updateSubjectSchema }) body: UpdateSubjectDto,
  ) {
    return {
      message: 'Subject updated successfully',
      subject: await this.subjectsService.update(id, body),
    };
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.subjectsService.delete(id);
    return { message: 'Subject deleted successfully' };
  }
}
