import { ApiProperty } from '@nestjs/swagger';
import { ToolListItemResponseDto } from './tool-list-item.dto';
import { FiltersAppliedResponseDto } from './filters-applied.dto';
import { PaginationResponseDto } from '@shared/dto/responses/pagination.dto';

export class ToolListResponseDto {
  @ApiProperty({ type: ToolListItemResponseDto, isArray: true })
  data!: ToolListItemResponseDto[];

  @ApiProperty({
    description: 'Total number of tools in the database (unfiltered)',
    example: 128,
  })
  total!: number;

  @ApiProperty({
    description: 'Number of tools matching the applied filters',
    example: 42,
  })
  filtered!: number;

  @ApiProperty({
    description:
      'Map of filters actually applied. Only provided filters are included; absent filters are omitted (not set to null).',
    type: FiltersAppliedResponseDto,
    example: {
      department: 'Engineering',
      status: 'active',
    },
  })
  filters_applied!: FiltersAppliedResponseDto;

  @ApiProperty({ type: PaginationResponseDto })
  pagination!: PaginationResponseDto;
}
