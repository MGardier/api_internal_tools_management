import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ToolRepository } from './tool.repository';
import { CategoryService } from '@modules/category/category.service';
import { QueryToolsRequestDto } from './dto/requests/query-tools.dto';
import { CreateToolRequestDto } from './dto/requests/create-tools.dto';
import { UpdateToolRequestDto } from './dto/requests/update-tools.dto';
import { ToolListItemResponseDto } from './dto/responses/tool-list-item.dto';
import { ToolListResponseDto } from './dto/responses/tool-list.dto';
import { ToolDetailResponseDto } from './dto/responses/tool-detail.dto';
import { ToolMutationResponseDto } from './dto/responses/tool-mutation.dto';
import { FiltersAppliedResponseDto } from './dto/responses/filters-applied.dto';
import {
  DateWindow,
  ToolNameSummary,
  ToolWithDetailIncludes,
  ToolWithListIncludes,
  UsageMetricsRaw,
} from './types';


@Injectable()
export class ToolService {
  constructor(
    private readonly toolRepository: ToolRepository,
    private readonly categoryService: CategoryService,
  ) {}

  // =============================================================================
  //                          CREATE
  // =============================================================================

  async create(dto: CreateToolRequestDto): Promise<ToolMutationResponseDto> {
    const categoryExists = await this.categoryService.existsById(dto.category_id);
    if (!categoryExists) 
      throw new BadRequestException({
        error: 'Validation failed',
        details: {
          category_id: `Category with ID ${dto.category_id} does not exist`,
        },
      });
    

    const existing = await this.findByName(dto.name);
    if (existing) 
      throw new ConflictException({
        error: 'Tool already exists',
        message: `A tool with name "${existing.name}" already exists`,
      });
    

    const tool = await this.toolRepository.create(dto);
    return this.toMutationResponse(tool);
  }

  // =============================================================================
  //                          UPDATE
  // =============================================================================

  async update(
    id: number,
    dto: UpdateToolRequestDto,
  ): Promise<ToolMutationResponseDto> {
    const exists = await this.existsById(id);
    if (!exists)
      throw new NotFoundException({
        error: 'Tool not found',
        message: `Tool with ID ${id} does not exist`,
      });

    if (dto.category_id) {
      const categoryExists = await this.categoryService.existsById(
        dto.category_id,
      );
      if (!categoryExists)
        throw new BadRequestException({
          error: 'Validation failed',
          details: {
            category_id: `Category with ID ${dto.category_id} does not exist`,
          },
        });
    }

    const tool = await this.toolRepository.update(id, dto);
    return this.toMutationResponse(tool);
  }

  // =============================================================================
  //                          EXIST
  // =============================================================================

  async existsById(id: number): Promise<boolean> {
    const count = await this.toolRepository.countById(id);
    return count > 0;
  }

  // =============================================================================
  //                          FIND ALL
  // =============================================================================

  async findAll(query: QueryToolsRequestDto): Promise<ToolListResponseDto> {
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

  async findOne(id: number): Promise<ToolDetailResponseDto> {
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
  //                          FIND BY NAME
  // =============================================================================

  findByName(name: string): Promise<ToolNameSummary | null> {
    return this.toolRepository.findByName(name);
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

  private buildFiltersApplied(query: QueryToolsRequestDto): FiltersAppliedResponseDto {
    const filters: FiltersAppliedResponseDto = {};
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

  private toListItem(tool: ToolWithListIncludes): ToolListItemResponseDto {
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
  ): ToolDetailResponseDto {
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

  private toMutationResponse(
    tool: ToolWithDetailIncludes,
  ): ToolMutationResponseDto {
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
      active_users_count: tool._count.userToolAccesses,
      created_at: tool.createdAt.toISOString(),
      updated_at: tool.updatedAt.toISOString(),
    };
  }

}
