import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  ParseFilePipe,
  Query,
  Redirect,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '../common/pagination.js';
import {
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
  async findByUnitId(
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Query({ schema: paginationQuerySchema }) pagination: PaginationQuery,
  ) {
    const { items, metadata } = await this.contentsService.findByUnitId(
      unitId,
      pagination,
    );
    return {
      message: 'Contents retrieved successfully',
      contents: items,
      ...(metadata ? { metadata } : {}),
    };
  }

  @Post('units/:unitId/contents')
  @UseGuards(AdminGuard)
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
  async create(
    @Param('unitId', ParseUUIDPipe) unitId: string,
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
    return {
      message: 'Content created successfully',
      content: await this.contentsService.create(unitId, body, file),
    };
  }

  @Get('contents/:id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return {
      message: 'Content retrieved successfully',
      content: await this.contentsService.findById(id),
    };
  }

  @Get('contents/:id/file')
  @Redirect()
  async getPdf(@Param('id', ParseUUIDPipe) id: string) {
    const { url } = await this.contentsService.getPdf(id);
    return { url, statusCode: HttpStatus.FOUND };
  }

  @Patch('contents/:id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: updateContentSchema }) body: UpdateContentDto,
  ) {
    return {
      message: 'Content updated successfully',
      content: await this.contentsService.update(id, body),
    };
  }

  @Delete('contents/:id')
  @UseGuards(AdminGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.contentsService.delete(id);
    return { message: 'Content deleted successfully' };
  }
}
