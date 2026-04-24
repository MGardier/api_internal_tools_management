import { ApiProperty } from '@nestjs/swagger';
import { DepartmentType, ToolStatusType } from '@prisma/client';

export class ToolMutationResponseDto {
  @ApiProperty({ example: 21 })
  id!: number;

  @ApiProperty({ example: 'Linear' })
  name!: string;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'Issue tracking and project management',
  })
  description!: string | null;

  @ApiProperty({ example: 'Linear' })
  vendor!: string;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'https://linear.app',
  })
  website_url!: string | null;

  @ApiProperty({ example: 'Development' })
  category!: string;

  @ApiProperty({ example: 8.0 })
  monthly_cost!: number;

  @ApiProperty({ enum: DepartmentType, example: 'Engineering' })
  owner_department!: DepartmentType;

  @ApiProperty({ enum: ToolStatusType, example: 'active' })
  status!: ToolStatusType;

  @ApiProperty({
    example: 0,
    description:
      'Number of users with active access to this tool (computed from user_tool_access).',
  })
  active_users_count!: number;

  @ApiProperty({ example: '2025-08-20T14:30:00.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2025-08-20T14:30:00.000Z' })
  updated_at!: string;
}