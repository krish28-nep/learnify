import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Subject as PrismaSubject } from '../generated/prisma/client.js';
import { SubjectsRepository } from './subjects.repository.js';
import type { CreateSubjectDto, UpdateSubjectDto } from './subject.schemas.js';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepository: SubjectsRepository) {}

  findAll(): Promise<PrismaSubject[]> {
    return this.subjectsRepository.findAll();
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
