import { PrismaService } from '@db/prisma.service';

const TABLES = [
  'access_requests',
  'cost_tracking',
  'usage_logs',
  'user_tool_access',
  'tools',
  'users',
  'categories',
] as const;

export async function resetDatabase(prisma: PrismaService): Promise<void> {
  const tableList = TABLES.map((t) => `"${t}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`,
  );
}
