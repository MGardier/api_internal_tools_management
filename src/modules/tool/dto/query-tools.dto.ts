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
import { DepartmentType, ToolStatusType } from '@prisma/client';
import { IsGreaterThanOrEqual } from '../../../app/validators/is-greater-than-or-equal.validator';
import { SortOrder, ToolSortField } from '../types';

const SORT_FIELDS: ToolSortField[] = ['cost', 'name', 'date'];
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

export class QueryToolsDto {
  @IsOptional()
  @IsEnum(DepartmentType)
  department?: DepartmentType;

  @IsOptional()
  @IsEnum(ToolStatusType)
  status?: ToolStatusType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsGreaterThanOrEqual('min_cost', {
    message: 'max_cost must be greater than or equal to min_cost',
  })
  max_cost?: number;

  @IsOptional()
  @IsIn(SORT_FIELDS)
  sort: ToolSortField = 'name';

  @IsOptional()
  @IsIn(SORT_ORDERS)
  order: SortOrder = 'asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
