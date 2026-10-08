import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  Patch,
  Post,
  ParseFilePipe,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'node:fs';
import { AdminOrInstructorGuard } from '../auth/guards/admin-or-instructor.guard.js';
import {
  contentIdSchema,
  contentUnitIdSchema,
  createContentSchema,
  updateContentSchema,
  type CreateContentDto,
  type UpdateContentDto,
} from './content.schemas.js';
import { ContentsService } from './contents.service.js';

const MAX_PDF_SIZE = 10 * 1024 * 1024;

interface UploadedPdf {
  buffer: Buffer;
  originalname: string;
}

@ApiTags('Contents')
@Controller()
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('units/:unitId/contents')
  findByUnitId(
    @Param('unitId', { schema: contentUnitIdSchema }) unitId: string,
  ) {
    return this.contentsService.findByUnitId(unitId);
  }

  @Post('units/:unitId/contents')
  @UseGuards(AdminOrInstructorGuard)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_PDF_SIZE } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'file'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  create(
    @Param('unitId', { schema: contentUnitIdSchema }) unitId: string,
    @Body({ schema: createContentSchema }) body: CreateContentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PDF_SIZE }),
          new FileTypeValidator({
            fileType: 'application/pdf',
            overrideMimeType: true,
          }),
        ],
      }),
    )
    file: UploadedPdf,
  ) {
    return this.contentsService.create(unitId, body, file);
  }

  @Get('contents/:id')
  findById(@Param('id', { schema: contentIdSchema }) id: string) {
    return this.contentsService.findById(id);
  }

  @Get('contents/:id/file')
  async getPdf(
    @Param('id', { schema: contentIdSchema }) id: string,
  ): Promise<StreamableFile> {
    const { path, fileName } = await this.contentsService.getPdf(id);
    const disposition = fileName
      ? `inline; filename="${fileName.replace(/[\r\n"]/g, '_')}"`
      : 'inline';
    return new StreamableFile(createReadStream(path), {
      type: 'application/pdf',
      disposition,
    });
  }

  @Patch('contents/:id')
  @UseGuards(AdminOrInstructorGuard)
  update(
    @Param('id', { schema: contentIdSchema }) id: string,
    @Body({ schema: updateContentSchema }) body: UpdateContentDto,
  ) {
    return this.contentsService.update(id, body);
  }

  @Delete('contents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminOrInstructorGuard)
  async delete(
    @Param('id', { schema: contentIdSchema }) id: string,
  ): Promise<void> {
    await this.contentsService.delete(id);
  }
}
