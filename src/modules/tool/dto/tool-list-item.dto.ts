import { DepartmentType, ToolStatusType } from '@prisma/client';

export class ToolListItemDto {
  id: number;
  name: string;
  description: string | null;
  vendor: string ;
  category: string;
  monthly_cost: number;
  owner_department: DepartmentType;
  status: ToolStatusType;
  website_url: string | null;
  active_users_count: number;
  created_at: string;
}
