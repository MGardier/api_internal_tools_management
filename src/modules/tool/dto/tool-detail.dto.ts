import { ApiProperty } from '@nestjs/swagger';
import { DepartmentType, ToolStatusType } from '@prisma/client';
import { UsageMetricsDto } from './usage-metrics.dto';

export class ToolDetailDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'Confluence' })
  name: string;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'Team collaboration and documentation',
  })
  description: string | null;

  @ApiProperty({ example: 'Atlassian' })
  vendor: string;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'https://confluence.atlassian.com',
  })
  website_url: string | null;

  @ApiProperty({ example: 'Development' })
  category: string;

  @ApiProperty({ example: 5.5 })
  monthly_cost: number;

  @ApiProperty({ enum: DepartmentType, example: 'Engineering' })
  owner_department: DepartmentType;

  @ApiProperty({ enum: ToolStatusType, example: 'active' })
  status: ToolStatusType;

  @ApiProperty({ example: 9 })
  active_users_count: number;

  @ApiProperty({ example: 49.5 })
  total_monthly_cost: number;

  @ApiProperty({ example: '2025-05-01T09:00:00.000Z' })
  created_at: string;

  @ApiProperty({ example: '2025-05-01T09:00:00.000Z' })
  updated_at: string;

  @ApiProperty({ type: UsageMetricsDto })
  usage_metrics: UsageMetricsDto;
}
