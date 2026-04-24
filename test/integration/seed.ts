import { PrismaService } from "@db/prisma.service";
import { SeedTool } from "./types";



export async function seedTools(
  prisma: PrismaService,
  tools: SeedTool[],
  categoryName = 'Design',
): Promise<void> {
  const category = await prisma.category.create({
    data: { name: categoryName },
  });
  for (const t of tools) {
    await prisma.tool.create({
      data: {
        name: t.name,
        vendor: t.vendor ?? 'Acme',
        monthlyCost: t.monthlyCost ?? 100,
        ownerDepartment: t.ownerDepartment ?? 'Engineering',
        status: t.status ?? 'active',
        description: t.description ?? null,
        websiteUrl: t.websiteUrl ?? null,
        category: { connect: { id: category.id } },
      },
    });
  }
}
