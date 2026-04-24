import { ApiProperty } from "@nestjs/swagger";

export class PaginationResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 5 })
  total_pages!: number;
}
