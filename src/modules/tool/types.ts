import { Prisma } from '@prisma/client';
import { TOOL_LIST_INCLUDE } from './constants';

export type ToolSortField = 'cost' | 'name' | 'date';

export type ToolWithListIncludes = Prisma.ToolGetPayload<{
  include: typeof TOOL_LIST_INCLUDE;
}>;
