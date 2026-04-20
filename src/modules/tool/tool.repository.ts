import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { QueryToolsDto } from './dto/query-tools.dto';
import { SORT_FIELD_MAP, TOOL_LIST_INCLUDE } from './constants';
import { ToolWithListIncludes } from './types';

@Injectable()
export class ToolRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =============================================================================
  //                            FIND ALL
  // =============================================================================

  findMany(query: QueryToolsDto): Promise<ToolWithListIncludes[]> {
    const where = this.buildWhere(query);
    const orderBy: Prisma.ToolOrderByWithRelationInput = {
      [SORT_FIELD_MAP[query.sort]]: query.order,
    };

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    return this.prisma.tool.findMany({
      where,
      orderBy,
      skip,
      take,
      include: TOOL_LIST_INCLUDE,
    });
  }

  count(query?: QueryToolsDto): Promise<number> {
    const where = query ? this.buildWhere(query) : {};
    return this.prisma.tool.count({ where });
  }

  // =============================================================================
  //                            PRIVATE
  // =============================================================================

  private buildWhere(query: QueryToolsDto): Prisma.ToolWhereInput {
    const where: Prisma.ToolWhereInput = {};

    if (query.department) where.ownerDepartment = query.department;
    if (query.status) where.status = query.status;
    if (query.category) where.category = { name: query.category };

    if (query.min_cost !== undefined || query.max_cost !== undefined) {
      const monthlyCost: Prisma.DecimalFilter = {};
      if (query.min_cost !== undefined) monthlyCost.gte = query.min_cost;
      if (query.max_cost !== undefined) monthlyCost.lte = query.max_cost;
      where.monthlyCost = monthlyCost;
    }

    return where;
  }
}
