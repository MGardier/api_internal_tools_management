import { ApiProperty } from '@nestjs/swagger';
import { DepartmentType, ToolStatusType } from '@prisma/client';

export class ToolListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Figma' })
  name: string;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'Collaborative design tool',
  })
  description: string | null;

  @ApiProperty({ example: 'Figma Inc.' })
  vendor: string;

  @ApiProperty({ example: 'Design' })
  category: string;

  @ApiProperty({ example: 150.0 })
  monthly_cost: number;

  @ApiProperty({ enum: DepartmentType, example: 'Design' })
  owner_department: DepartmentType;

  @ApiProperty({ enum: ToolStatusType, example: 'active' })
  status: ToolStatusType;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'https://figma.com',
  })
  website_url: string | null;

  @ApiProperty({ example: 42 })
  active_users_count: number;

  @ApiProperty({ example: '2025-01-15T09:30:00.000Z' })
  created_at: string;
}
