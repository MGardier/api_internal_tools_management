import { Injectable, NotFoundException } from '@nestjs/common';
import { ToolRepository } from './tool.repository';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolListItemDto } from './dto/tool-list-item.dto';
import { ToolListResponseDto } from './dto/tool-list-response.dto';
import { ToolDetailDto } from './dto/tool-detail.dto';
import { FiltersAppliedDto } from './dto/filters-applied.dto';
import {
  DateWindow,
  ToolWithDetailIncludes,
  ToolWithListIncludes,
  UsageMetricsRaw,
} from './types';


@Injectable()
export class ToolService {
  constructor(private readonly toolRepository: ToolRepository) {}

  // =============================================================================
  //                          FIND ALL
  // =============================================================================

  async findAll(query: QueryToolsDto): Promise<ToolListResponseDto> {
    const [items, filtered, total] = await Promise.all([
      this.toolRepository.findMany(query),
      this.toolRepository.count(query),
      this.toolRepository.countAll(),
    ]);

    return {
      data: items.map((item) => this.toListItem(item)),
      total,
      filtered,
      filters_applied: this.buildFiltersApplied(query),
      pagination: {
        page: query.page,
        limit: query.limit,
        total_pages: Math.ceil(filtered / query.limit),
      },
    };
  }

  // =============================================================================
  //                          FIND ONE
  // =============================================================================

  async findOne(id: number): Promise<ToolDetailDto> {
    const tool = await this.toolRepository.findById(id);

    if (!tool) 
      throw new NotFoundException({
        error: 'Tool not found',
        message: `Tool with ID ${id} does not exist`,
      });
    

    const {since,until} = this.getDateWindow();
    const usageMetrics = await this.toolRepository.getUsageMetrics(id, since,until);

    return this.toDetail(tool, usageMetrics);
  }

  // =============================================================================
  //                            PRIVATE
  // =============================================================================


  private getDateWindow(): DateWindow {
    const until = new Date();
    until.setUTCHours(0, 0, 0, 0);
    const since = new Date(until);
    since.setUTCDate(since.getUTCDate() - 30);
    return { since, until };
  }

  private buildFiltersApplied(query: QueryToolsDto): FiltersAppliedDto {
    const filters: FiltersAppliedDto = {};
    if (query.department) filters.department = query.department;
    if (query.status) filters.status = query.status;
    if (query.category) filters.category = query.category;
    if (query.min_cost !== undefined) filters.min_cost = query.min_cost;
    if (query.max_cost !== undefined) filters.max_cost = query.max_cost;
    return filters;
  }



  // =============================================================================
  //                        PRIVATE MAPPING
  // =============================================================================

  private toListItem(tool: ToolWithListIncludes): ToolListItemDto {
    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      vendor: tool.vendor,
      category: tool.category.name,
      monthly_cost: tool.monthlyCost.toNumber(),
      owner_department: tool.ownerDepartment,
      status: tool.status,
      website_url: tool.websiteUrl,
      active_users_count: tool._count.userToolAccesses,
      created_at: tool.createdAt.toISOString(),
    };
  }

    private toDetail(
    tool: ToolWithDetailIncludes,
    usageMetrics: UsageMetricsRaw,
  ): ToolDetailDto {
    const activeUsersCount = tool._count.userToolAccesses;

    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      vendor: tool.vendor,
      website_url: tool.websiteUrl,
      category: tool.category.name,
      monthly_cost: tool.monthlyCost.toNumber(),
      owner_department: tool.ownerDepartment,
      status: tool.status,
      active_users_count: activeUsersCount,
      total_monthly_cost: tool.monthlyCost
        .mul(activeUsersCount)
        .toDecimalPlaces(2)
        .toNumber(),
      created_at: tool.createdAt.toISOString(),
      updated_at: tool.updatedAt.toISOString(),
      usage_metrics: {
        last_30_days: {
          total_sessions: usageMetrics._count.id,
          avg_session_minutes: Math.round(usageMetrics._avg.usageMinutes ?? 0),
        },
      },
    };
  }

}
