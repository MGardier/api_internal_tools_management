import { Prisma } from '@prisma/client';
import { CATEGORY_MIN_SELECT } from './constants';

export type CategoryNameSummary = Prisma.CategoryGetPayload<{
  select: typeof CATEGORY_MIN_SELECT;
}>;
