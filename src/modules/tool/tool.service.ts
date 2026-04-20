import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ToolRepository } from './tool.repository';
import { QueryToolsDto } from './dto/query-tools.dto';
import { ToolListItemDto } from './dto/tool-list-item.dto';
import {
  FiltersAppliedDto,
  ToolListResponseDto,
} from './dto/tool-list-response.dto';
import { ToolWithListIncludes } from './types';

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
  //                            PRIVATE
  // =============================================================================

  private buildFiltersApplied(query: QueryToolsDto): FiltersAppliedDto {
    const filters: FiltersAppliedDto = {};
    if (query.department) filters.department = query.department;
    if (query.status) filters.status = query.status;
    if (query.category) filters.category = query.category;
    if (query.min_cost !== undefined) filters.min_cost = query.min_cost;
    if (query.max_cost !== undefined) filters.max_cost = query.max_cost;
    return filters;
  }

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
}
