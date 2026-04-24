import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentType, ToolStatusType } from '@prisma/client';
import { IsGreaterThanOrEqual } from '@app/validators/is-greater-than-or-equal.validator';
import { ToolSortField } from '../../types';
import { SORT_FIELDS } from '../../constants';
import { SORT_ORDERS } from '@shared/constants/constants';
import { SortOrder } from '@shared/types/types';

export class QueryToolsDto {
  @ApiPropertyOptional({
    enum: DepartmentType,
    description: 'Filter by owner department',
    example: 'Engineering',
  })
  @IsOptional()
  @IsEnum(DepartmentType)
  department?: DepartmentType;

  @ApiPropertyOptional({
    enum: ToolStatusType,
    description: 'Filter by tool status',
    example: 'active',
  })
  @IsOptional()
  @IsEnum(ToolStatusType)
  status?: ToolStatusType;

  @ApiPropertyOptional({
    description: 'Filter by category name',
    example: 'Design',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Minimum monthly cost (inclusive)',
    minimum: 0,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_cost?: number;

  @ApiPropertyOptional({
    description:
      'Maximum monthly cost (inclusive). Must be ≥ min_cost when both provided.',
    minimum: 0,
    example: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsGreaterThanOrEqual('min_cost', {
    message: 'max_cost must be greater than or equal to min_cost',
  })
  max_cost?: number;

  @ApiPropertyOptional({
    enum: SORT_FIELDS,
    description: 'Field to sort on',
    default: 'name',
  })
  @IsOptional()
  @IsIn(SORT_FIELDS)
  sort: ToolSortField = 'name';

  @ApiPropertyOptional({
    enum: SORT_ORDERS,
    description: 'Sort direction',
    default: 'asc',
  })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order: SortOrder = 'asc';

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
