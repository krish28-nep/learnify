import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PaginationOptions } from '../common/pagination.js';
import type { Content as PrismaContent } from '../generated/prisma/client.js';
import type { CreateContentDto, UpdateContentDto } from './content.schemas.js';

@Injectable()
export class ContentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  unitExists(unitId: string): Promise<{ id: string } | null> {
    return this.prisma.unit.findUnique({
      where: { id: unitId },
      select: { id: true },
    });
  }

  findByUnitId(
    unitId: string,
    options?: PaginationOptions,
  ): Promise<PrismaContent[]> {
    return this.prisma.content.findMany({
      where: { unitId },
      ...options,
      orderBy: [{ createdAt: 'asc' }, { title: 'asc' }],
    });
  }

  countByUnitId(unitId: string): Promise<number> {
    return this.prisma.content.count({ where: { unitId } });
  }

  findById(id: string): Promise<PrismaContent | null> {
    return this.prisma.content.findUnique({ where: { id } });
  }

  create(
    unitId: string,
    data: CreateContentDto,
    fileUrl: string,
    filePublicId: string,
    fileName: string,
  ): Promise<PrismaContent> {
    return this.prisma.content.create({
      data: { ...data, unitId, fileUrl, filePublicId, fileName },
    });
  }

  update(id: string, data: UpdateContentDto): Promise<PrismaContent> {
    return this.prisma.content.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.content.delete({ where: { id } });
  }
}
