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
import {
  createSubjectSchema,
  subjectIdSchema,
  updateSubjectSchema,
  type CreateSubjectDto,
  type UpdateSubjectDto,
} from './subject.schemas.js';
import { AdminOrInstructorGuard } from '../auth/guards/admin-or-instructor.guard.js';
import { SubjectsService } from './subjects.service.js';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', { schema: subjectIdSchema }) id: string) {
    return this.subjectsService.findById(id);
  }

  @Post()
  @UseGuards(AdminOrInstructorGuard)
  create(@Body({ schema: createSubjectSchema }) body: CreateSubjectDto) {
    return this.subjectsService.create(body);
  }

  @Patch(':id')
  @UseGuards(AdminOrInstructorGuard)
  update(
    @Param('id', { schema: subjectIdSchema }) id: string,
    @Body({ schema: updateSubjectSchema }) body: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminOrInstructorGuard)
  async delete(
    @Param('id', { schema: subjectIdSchema }) id: string,
  ): Promise<void> {
    await this.subjectsService.delete(id);
  }
}
