import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateToolRequestDto } from './create-tools.dto';

export class UpdateToolRequestDto extends PartialType(
  OmitType(CreateToolRequestDto, ['name'] as const),
) {}
