import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Unit as PrismaUnit } from '../generated/prisma/client.js';
import type {
  PaginationMetadata,
  PaginationQuery,
} from '../common/pagination.js';
import { UnitsRepository } from './units.repository.js';
import type { CreateUnitDto, UpdateUnitDto } from './unit.schemas.js';

@Injectable()
export class UnitsService {
  constructor(private readonly unitsRepository: UnitsRepository) {}

  async findBySubjectId(
    subjectId: string,
    pagination: PaginationQuery,
  ): Promise<{ items: PrismaUnit[]; metadata?: PaginationMetadata }> {
    await this.requireSubject(subjectId);
    if (pagination.page === undefined && pagination.pageSize === undefined) {
      return {
        items: await this.unitsRepository.findBySubjectId(subjectId),
      };
    }

    const page = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const [items, totalItems] = await Promise.all([
      this.unitsRepository.findBySubjectId(subjectId, {
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.unitsRepository.countBySubjectId(subjectId),
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

  async findById(id: string): Promise<PrismaUnit> {
    const unit = await this.unitsRepository.findById(id);
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  async create(subjectId: string, data: CreateUnitDto): Promise<PrismaUnit> {
    await this.requireSubject(subjectId);
    if (
      await this.unitsRepository.findBySubjectAndTitle(subjectId, data.title)
    ) {
      throw new ConflictException(
        'A unit with this title already exists in this subject',
      );
    }
    return this.unitsRepository.create(subjectId, data);
  }

  async update(id: string, data: UpdateUnitDto): Promise<PrismaUnit> {
    const existing = await this.unitsRepository.findById(id);
    if (!existing) throw new NotFoundException('Unit not found');
    if (data.title) {
      const duplicate = await this.unitsRepository.findBySubjectAndTitle(
        existing.subjectId,
        data.title,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          'A unit with this title already exists in this subject',
        );
      }
    }
    return this.unitsRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    if (!(await this.unitsRepository.findById(id)))
      throw new NotFoundException('Unit not found');
    await this.unitsRepository.delete(id);
  }

  private async requireSubject(subjectId: string): Promise<void> {
    if (!(await this.unitsRepository.subjectExists(subjectId))) {
      throw new NotFoundException('Subject not found');
    }
  }
}
