import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'Internal server error' })
  error!: string;

  @ApiProperty({ example: 'Database connection failed' })
  message!: string;
}