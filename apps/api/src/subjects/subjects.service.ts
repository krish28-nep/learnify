import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Subject as PrismaSubject } from '../generated/prisma/client.js';
import type {
  PaginationMetadata,
  PaginationQuery,
} from '../common/pagination.js';
import { SubjectsRepository } from './subjects.repository.js';
import type { CreateSubjectDto, UpdateSubjectDto } from './subject.schemas.js';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepository: SubjectsRepository) {}

  async findAll(pagination: PaginationQuery): Promise<{
    items: PrismaSubject[];
    metadata?: PaginationMetadata;
  }> {
    if (pagination.page === undefined && pagination.pageSize === undefined) {
      return { items: await this.subjectsRepository.findAll() };
    }

    const page = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const [items, totalItems] = await Promise.all([
      this.subjectsRepository.findAll({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.subjectsRepository.count(),
    ]);

    return {
      items,
      metadata: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async findById(id: string): Promise<PrismaSubject> {
    const subject = await this.subjectsRepository.findById(id);
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  async create(data: CreateSubjectDto): Promise<PrismaSubject> {
    if (await this.subjectsRepository.findBySlug(data.slug)) {
      throw new ConflictException('A subject with this slug already exists');
    }
    return this.subjectsRepository.create(data);
  }

  async update(id: string, data: UpdateSubjectDto): Promise<PrismaSubject> {
    await this.findById(id);
    if (data.slug) {
      const subject = await this.subjectsRepository.findBySlug(data.slug);
      if (subject && subject.id !== id) {
        throw new ConflictException('A subject with this slug already exists');
      }
    }

    return this.subjectsRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.subjectsRepository.delete(id);
  }
}
