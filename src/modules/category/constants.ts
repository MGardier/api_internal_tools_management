import { Prisma } from '@prisma/client';

export const CATEGORY_MIN_SELECT = {
  id: true,
  name: true,
} satisfies Prisma.CategorySelect;
