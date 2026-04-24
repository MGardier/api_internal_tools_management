import { ApiProperty,  } from '@nestjs/swagger';
import { ToolListItemDto } from './tool-list-item.dto';
import { FiltersAppliedDto } from './filters-applied.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';



export class ToolListResponseDto {
  @ApiProperty({ type: ToolListItemDto, isArray: true })
  data!: ToolListItemDto[];

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
    description: 'Map of filters actually applied. Only provided filters are included; absent filters are omitted (not set to null).',
    type: FiltersAppliedDto,
    example: {
      department: 'Engineering',
      status: 'active',
    },
  })
  filters_applied!: FiltersAppliedDto;


  @ApiProperty({ type: PaginationDto })
  pagination!: PaginationDto;
}
