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
    try {
      return await this.subjectsRepository.create(data);
    } catch (error) {
      if (hasPrismaCode(error, 'P2002')) {
        throw new ConflictException('A subject with this slug already exists');
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateSubjectDto): Promise<PrismaSubject> {
    try {
      return await this.subjectsRepository.update(id, data);
    } catch (error) {
      if (hasPrismaCode(error, 'P2002')) {
        throw new ConflictException('A subject with this slug already exists');
      }
      if (hasPrismaCode(error, 'P2025')) {
        throw new NotFoundException('Subject not found');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.subjectsRepository.delete(id);
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) {
        throw new NotFoundException('Subject not found');
      }
      throw error;
    }
  }
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}
