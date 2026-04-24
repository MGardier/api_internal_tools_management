import { Prisma } from '@prisma/client';
import {
  TOOL_DETAIL_INCLUDE,
  TOOL_LIST_INCLUDE,
  TOOL_MIN_SELECT,
} from './constants';

export type ToolSortField = 'cost' | 'name' | 'date';

export type ToolWithListIncludes = Prisma.ToolGetPayload<{
  include: typeof TOOL_LIST_INCLUDE;
}>;

export type ToolWithDetailIncludes = Prisma.ToolGetPayload<{
  include: typeof TOOL_DETAIL_INCLUDE;
}>;

export type ToolNameSummary = Prisma.ToolGetPayload<{
  select: typeof TOOL_MIN_SELECT;
}>;

export interface UsageMetricsRaw {
  _count: { id: number };
  _avg: { usageMinutes: number | null };
}



export type DateWindow = { since: Date; until: Date }