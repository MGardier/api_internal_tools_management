import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@db/prisma.service';
import { QueryToolsRequestDto } from './dto/requests/query-tools.dto';
import { CreateToolRequestDto } from './dto/requests/create-tools.dto';
import { UpdateToolRequestDto } from './dto/requests/update-tools.dto';
import {
  SORT_FIELD_MAP,
  TOOL_DETAIL_INCLUDE,
  TOOL_LIST_INCLUDE,
  TOOL_MIN_SELECT,
} from './constants';
import {
  ToolNameSummary,
  ToolWithDetailIncludes,
  ToolWithListIncludes,
  UsageMetricsRaw,
} from './types';

@Injectable()
export class ToolRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =============================================================================
  //                            FIND ALL
  // =============================================================================

  findMany(query: QueryToolsRequestDto): Promise<ToolWithListIncludes[]> {
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

  countAll(): Promise<number> {
    return this.prisma.tool.count();
  }

  count(query?: QueryToolsRequestDto): Promise<number> {
    const where = query ? this.buildWhere(query) : {};
    return this.prisma.tool.count({ where });
  }

  countById(id: number): Promise<number> {
    return this.prisma.tool.count({ where: { id } });
  }

  // =============================================================================
  //                            FIND ONE
  // =============================================================================

  findById(id: number): Promise<ToolWithDetailIncludes | null> {
    return this.prisma.tool.findUnique({
      where: { id },
      include: TOOL_DETAIL_INCLUDE,
    });
  }

  // =============================================================================
  //                            FIND BY NAME
  // =============================================================================

  findByName(name: string): Promise<ToolNameSummary | null> {
    return this.prisma.tool.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: TOOL_MIN_SELECT,
    });
  }

  // =============================================================================
  //                            CREATE
  // =============================================================================

  create(dto: CreateToolRequestDto): Promise<ToolWithDetailIncludes> {
    return this.prisma.tool.create({
      data: {
        name: dto.name,
        description: dto.description,
        vendor: dto.vendor,
        websiteUrl: dto.website_url,
        monthlyCost: dto.monthly_cost,
        ownerDepartment: dto.owner_department,
        status: 'active',
        category: { connect: { id: dto.category_id } },
      },
      include: TOOL_DETAIL_INCLUDE,
    });
  }

  // =============================================================================
  //                            UPDATE
  // =============================================================================

  update(
    id: number,
    dto: UpdateToolRequestDto,
  ): Promise<ToolWithDetailIncludes> {
    return this.prisma.tool.update({
      where: { id },
      data: {
        description: dto.description,
        vendor: dto.vendor,
        websiteUrl: dto.website_url,
        monthlyCost: dto.monthly_cost,
        ownerDepartment: dto.owner_department,
        ...(dto.category_id && {
          category: { connect: { id: dto.category_id } },
        }),
      },
      include: TOOL_DETAIL_INCLUDE,
    });
  }

  getUsageMetrics(toolId: number, since: Date, until: Date): Promise<UsageMetricsRaw> {
    return this.prisma.usageLog.aggregate({
      where: {
        toolId,
        sessionDate: { gte: since, lte: until  },
      },
      _count: { id: true },
      _avg: { usageMinutes: true },
    });
  }

  // =============================================================================
  //                            PRIVATE
  // =============================================================================

  private buildWhere(query: QueryToolsRequestDto): Prisma.ToolWhereInput {
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
