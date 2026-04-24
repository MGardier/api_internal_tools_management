import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentType } from '@prisma/client';

export class CreateToolRequestDto {
  @ApiProperty({
    example: 'Linear',
    minLength: 2,
    maxLength: 100,
    description:
      'Tool name. Must be unique (uniqueness enforced case-insensitively).',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Issue tracking and project management',
    description: 'Free-text description of the tool.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Linear',
    maxLength: 100,
    description: 'Vendor / publisher of the tool.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vendor!: string;

  @ApiPropertyOptional({
    example: 'https://linear.app',
    description: 'Official website URL. Must be a valid HTTP/HTTPS URL.',
  })
  @IsOptional()
  @IsUrl()
  website_url?: string;

  @ApiProperty({
    example: 2,
    minimum: 1,
    description: 'ID of the category the tool belongs to. Must exist.',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  category_id!: number;

  @ApiProperty({
    example: 8.0,
    minimum: 0,
    description:
      'Monthly cost per user. Zero is allowed (free tools). Max 2 decimal places.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthly_cost!: number;

  @ApiProperty({
    enum: DepartmentType,
    example: 'Engineering',
    description: 'Department that owns the tool.',
  })
  @IsEnum(DepartmentType)
  owner_department!: DepartmentType;
}