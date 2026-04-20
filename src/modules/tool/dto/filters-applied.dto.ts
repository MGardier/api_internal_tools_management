import { ApiPropertyOptional } from "@nestjs/swagger";
import { DepartmentType, ToolStatusType } from "@prisma/client";

export class FiltersAppliedDto {
  @ApiPropertyOptional({ enum: DepartmentType, example: 'Engineering' })
  department?: DepartmentType;

  @ApiPropertyOptional({ enum: ToolStatusType, example: 'active' })
  status?: ToolStatusType;

  @ApiPropertyOptional({ example: 'Design' })
  category?: string;

  @ApiPropertyOptional({ example: 10 })
  min_cost?: number;

  @ApiPropertyOptional({ example: 500 })
  max_cost?: number;
}
