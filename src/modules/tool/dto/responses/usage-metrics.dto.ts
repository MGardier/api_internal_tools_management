import { ApiProperty } from '@nestjs/swagger';

export class UsageMetricsLast30DaysResponseDto {
  @ApiProperty({ example: 127 })
  total_sessions!: number;

  @ApiProperty({ example: 45 })
  avg_session_minutes!: number;
}

export class UsageMetricsResponseDto {
  @ApiProperty({ type: UsageMetricsLast30DaysResponseDto })
  last_30_days!: UsageMetricsLast30DaysResponseDto;
}
