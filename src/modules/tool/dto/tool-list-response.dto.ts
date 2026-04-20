import { DepartmentType, ToolStatusType } from '@prisma/client';
import { ToolListItemDto } from './tool-list-item.dto';

export class PaginationDto {
  page: number;
  limit: number;
  total_pages: number;
}

export class FiltersAppliedDto {
  department?: DepartmentType;
  status?: ToolStatusType;
  category?: string;
  min_cost?: number;
  max_cost?: number;
}

export class ToolListResponseDto {
  data: ToolListItemDto[];
  total: number;
  filtered: number;
  filters_applied: FiltersAppliedDto;
  pagination: PaginationDto;
}
