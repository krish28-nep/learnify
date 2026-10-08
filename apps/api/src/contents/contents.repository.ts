import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
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

  findByUnitId(unitId: string): Promise<PrismaContent[]> {
    return this.prisma.content.findMany({
      where: { unitId },
      orderBy: [{ createdAt: 'asc' }, { title: 'asc' }],
    });
  }

  findById(id: string): Promise<PrismaContent | null> {
    return this.prisma.content.findUnique({ where: { id } });
  }

  create(
    unitId: string,
    data: CreateContentDto,
    fileUrl: string,
    fileName: string,
  ): Promise<PrismaContent> {
    return this.prisma.content.create({
      data: { ...data, unitId, fileUrl, fileName },
    });
  }

  update(id: string, data: UpdateContentDto): Promise<PrismaContent> {
    return this.prisma.content.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.content.delete({ where: { id } });
  }
}
