import { ApiProperty } from '@nestjs/swagger';

export class UsageMetricsLast30DaysDto {
  @ApiProperty({ example: 127 })
  total_sessions: number;

  @ApiProperty({ example: 45 })
  avg_session_minutes: number;
}

export class UsageMetricsDto {
  @ApiProperty({ type: UsageMetricsLast30DaysDto })
  last_30_days: UsageMetricsLast30DaysDto;
}
