import { Injectable } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =============================================================================
  //                               COUNT
  // =============================================================================

  countById(id: number): Promise<number> {
    return this.prisma.category.count({ where: { id } });
  }
}
