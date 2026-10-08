import { Injectable, NotFoundException } from '@nestjs/common';
import type { Content as PrismaContent } from '../generated/prisma/client.js';
import { FileStorageService } from '../uploads/file-storage.service.js';
import { ContentsRepository } from './contents.repository.js';
import type { CreateContentDto, UpdateContentDto } from './content.schemas.js';

export type ContentResponse = Omit<PrismaContent, 'fileUrl'> & {
  fileUrl: string;
};

@Injectable()
export class ContentsService {
  constructor(
    private readonly contentsRepository: ContentsRepository,
    private readonly fileStorage: FileStorageService,
  ) {}

  async findByUnitId(unitId: string): Promise<ContentResponse[]> {
    await this.requireUnit(unitId);
    const contents = await this.contentsRepository.findByUnitId(unitId);
    return contents.map(toContentResponse);
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
    const fileKey = await this.fileStorage.save(file.buffer);
    try {
      const content = await this.contentsRepository.create(
        unitId,
        data,
        fileKey,
        safeFileName(file.originalname),
      );
      return toContentResponse(content);
    } catch (error) {
      await this.fileStorage.remove(fileKey);
      throw error;
    }
  }

  async update(id: string, data: UpdateContentDto): Promise<ContentResponse> {
    try {
      const content = await this.contentsRepository.update(id, data);
      return toContentResponse(content);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const content = await this.requireContent(id);
    await this.contentsRepository.delete(id);
    await this.fileStorage.remove(content.fileUrl);
  }

  async getPdf(id: string): Promise<{ path: string; fileName: string | null }> {
    const content = await this.requireContent(id);
    const path = await this.fileStorage.getPath(content.fileUrl);
    return { path, fileName: content.fileName };
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
  return { ...content, fileUrl: `/contents/${content.id}/file` };
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
