import { Injectable } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service';
import { CATEGORY_MIN_SELECT } from './constants';
import { CategoryNameSummary } from './types';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =============================================================================
  //                               COUNT
  // =============================================================================

  countById(id: number): Promise<number> {
    return this.prisma.category.count({ where: { id } });
  }

  // =============================================================================
  //                               FIND BY NAME
  // =============================================================================

  findByName(name: string): Promise<CategoryNameSummary | null> {
    return this.prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: CATEGORY_MIN_SELECT,
    });
  }
}
