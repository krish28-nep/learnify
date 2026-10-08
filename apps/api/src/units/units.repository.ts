import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Unit as PrismaUnit } from '../generated/prisma/client.js';
import type { CreateUnitDto, UpdateUnitDto } from './unit.schemas.js';

@Injectable()
export class UnitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  subjectExists(subjectId: string): Promise<{ id: string } | null> {
    return this.prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });
  }

  findBySubjectId(subjectId: string): Promise<PrismaUnit[]> {
    return this.prisma.unit.findMany({
      where: { subjectId },
      orderBy: [{ sortingOrder: 'asc' }, { title: 'asc' }],
    });
  }

  findById(id: string): Promise<PrismaUnit | null> {
    return this.prisma.unit.findUnique({ where: { id } });
  }

  create(subjectId: string, data: CreateUnitDto): Promise<PrismaUnit> {
    return this.prisma.unit.create({
      data: { ...data, subjectId },
    });
  }

  update(id: string, data: UpdateUnitDto): Promise<PrismaUnit> {
    return this.prisma.unit.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unit.delete({ where: { id } });
  }
}
