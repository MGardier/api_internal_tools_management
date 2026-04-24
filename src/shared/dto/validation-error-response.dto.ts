// src/app/dto/validation-error-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 'Validation failed' })
  error!: string;

  @ApiProperty({
    description: 'Field-level error messages',
    example: {
      department: 'department must be one of: Engineering, Sales, ...',
      min_cost: 'min_cost must not be less than 0',
    },
    additionalProperties: { type: 'string' },
  })
  details!: Record<string, string>;
}