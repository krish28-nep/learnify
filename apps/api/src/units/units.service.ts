import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Unit as PrismaUnit } from '../generated/prisma/client.js';
import { UnitsRepository } from './units.repository.js';
import type { CreateUnitDto, UpdateUnitDto } from './unit.schemas.js';

@Injectable()
export class UnitsService {
  constructor(private readonly unitsRepository: UnitsRepository) {}

  async findBySubjectId(subjectId: string): Promise<PrismaUnit[]> {
    await this.requireSubject(subjectId);
    return this.unitsRepository.findBySubjectId(subjectId);
  }

  async findById(id: string): Promise<PrismaUnit> {
    const unit = await this.unitsRepository.findById(id);
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  async create(subjectId: string, data: CreateUnitDto): Promise<PrismaUnit> {
    await this.requireSubject(subjectId);
    try {
      return await this.unitsRepository.create(subjectId, data);
    } catch (error) {
      if (hasPrismaCode(error, 'P2002')) {
        throw new ConflictException(
          'A unit with this title already exists in this subject',
        );
      }
      if (hasPrismaCode(error, 'P2003')) {
        throw new NotFoundException('Subject not found');
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateUnitDto): Promise<PrismaUnit> {
    try {
      return await this.unitsRepository.update(id, data);
    } catch (error) {
      if (hasPrismaCode(error, 'P2002')) {
        throw new ConflictException(
          'A unit with this title already exists in this subject',
        );
      }
      if (hasPrismaCode(error, 'P2025')) {
        throw new NotFoundException('Unit not found');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.unitsRepository.delete(id);
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) {
        throw new NotFoundException('Unit not found');
      }
      throw error;
    }
  }

  private async requireSubject(subjectId: string): Promise<void> {
    if (!(await this.unitsRepository.subjectExists(subjectId))) {
      throw new NotFoundException('Subject not found');
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
