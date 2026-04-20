import { Prisma } from '@prisma/client';
import { ToolSortField } from './types';

export const SORT_FIELDS: readonly ToolSortField[] = ['cost', 'name', 'date'];

export const SORT_FIELD_MAP: Record<
  ToolSortField,
  keyof Prisma.ToolOrderByWithRelationInput
> = {
  cost: 'monthlyCost',
  name: 'name',
  date: 'createdAt',
};

export const TOOL_LIST_INCLUDE = {
  category: true,
  _count: {
    select: {
      userToolAccesses: { where: { status: 'active' as const } },
    },
  },
} satisfies Prisma.ToolInclude;
