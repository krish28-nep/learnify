import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Subject as PrismaSubject } from '../generated/prisma/client.js';
import type { CreateSubjectDto, UpdateSubjectDto } from './subject.schemas.js';

@Injectable()
export class SubjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PrismaSubject[]> {
    return this.prisma.subject.findMany({
      orderBy: [{ sortingOrder: 'asc' }, { title: 'asc' }],
    });
  }

  findById(id: string): Promise<PrismaSubject | null> {
    return this.prisma.subject.findUnique({ where: { id } });
  }

  create(data: CreateSubjectDto): Promise<PrismaSubject> {
    return this.prisma.subject.create({ data });
  }

  update(id: string, data: UpdateSubjectDto): Promise<PrismaSubject> {
    return this.prisma.subject.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subject.delete({ where: { id } });
  }
}
