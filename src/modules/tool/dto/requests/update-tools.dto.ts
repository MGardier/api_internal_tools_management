import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ToolStatusType } from '@prisma/client';
import { CreateToolRequestDto } from './create-tools.dto';

export class UpdateToolRequestDto extends PartialType(
  OmitType(CreateToolRequestDto, ['name'] as const),
) {
  @ApiPropertyOptional({
    enum: ToolStatusType,
    example: 'deprecated',
    description: 'Lifecycle status of the tool.',
  })
  @IsOptional()
  @IsEnum(ToolStatusType)
  status?: ToolStatusType;
}
