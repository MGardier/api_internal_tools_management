import { DepartmentType, ToolStatusType } from "@prisma/client";

export type SeedTool = {
  name: string;
  vendor?: string;
  monthlyCost?: number;
  ownerDepartment?: DepartmentType;
  status?: ToolStatusType;
  description?: string | null;
  websiteUrl?: string | null;
};
