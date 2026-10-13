import { Injectable, NotFoundException } from '@nestjs/common';
import type { Content as PrismaContent } from '../generated/prisma/client.js';
import type {
  PaginationMetadata,
  PaginationQuery,
} from '../common/pagination.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { ContentsRepository } from './contents.repository.js';
import type { CreateContentDto, UpdateContentDto } from './content.schemas.js';

export type ContentResponse = Omit<
  PrismaContent,
  'fileUrl' | 'filePublicId'
> & {
  fileUrl: string;
};

@Injectable()
export class ContentsService {
  constructor(
    private readonly contentsRepository: ContentsRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findByUnitId(
    unitId: string,
    pagination: PaginationQuery,
  ): Promise<{ items: ContentResponse[]; metadata?: PaginationMetadata }> {
    await this.requireUnit(unitId);
    if (pagination.page === undefined && pagination.pageSize === undefined) {
      const contents = await this.contentsRepository.findByUnitId(unitId);
      return { items: contents.map(toContentResponse) };
    }

    const page = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const [contents, totalItems] = await Promise.all([
      this.contentsRepository.findByUnitId(unitId, {
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.contentsRepository.countByUnitId(unitId),
    ]);
    return {
      items: contents.map(toContentResponse),
      metadata: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async findById(id: string): Promise<ContentResponse> {
    const content = await this.requireContent(id);
    return toContentResponse(content);
  }

  async create(
    unitId: string,
    data: CreateContentDto,
    file: UploadedPdf,
  ): Promise<ContentResponse> {
    await this.requireUnit(unitId);
    const uploadedFile = await this.cloudinary.uploadFile(file);
    try {
      const content = await this.contentsRepository.create(
        unitId,
        data,
        uploadedFile.url,
        uploadedFile.publicId,
        safeFileName(file.originalname),
      );
      return toContentResponse(content);
    } catch (error) {
      await this.cloudinary.deleteFile(uploadedFile.publicId);
      throw error;
    }
  }

  async update(id: string, data: UpdateContentDto): Promise<ContentResponse> {
    const content = await this.contentsRepository.update(id, data);
    return toContentResponse(content);
  }

  async delete(id: string): Promise<void> {
    const content = await this.requireContent(id);
    await this.contentsRepository.delete(id);
    if (content.filePublicId) {
      await this.cloudinary.deleteFile(content.filePublicId);
    }
  }

  async getPdf(id: string): Promise<{ url: string }> {
    const content = await this.requireContent(id);
    if (!content.filePublicId) {
      throw new NotFoundException('PDF not found');
    }
    return { url: content.fileUrl };
  }

  private async requireContent(id: string): Promise<PrismaContent> {
    const content = await this.contentsRepository.findById(id);
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    return content;
  }

  private async requireUnit(unitId: string): Promise<void> {
    if (!(await this.contentsRepository.unitExists(unitId))) {
      throw new NotFoundException('Unit not found');
    }
  }
}

interface UploadedPdf {
  buffer: Buffer;
  originalname: string;
}

function toContentResponse(content: PrismaContent): ContentResponse {
  return {
    id: content.id,
    unitId: content.unitId,
    title: content.title,
    description: content.description,
    fileName: content.fileName,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
    fileUrl: `/contents/${content.id}/file`,
  };
}

function safeFileName(fileName: string): string {
  return (
    fileName
      .split(/[\\/]/)
      .at(-1)
      ?.replace(/[\r\n"]/g, '_')
      .slice(0, 255) || 'document.pdf'
  );
}
