import { INestApplication } from '@nestjs/common';
import request = require('supertest');

import { PrismaService } from '../../prisma/prisma.service';
import { setupTestApp } from '../setup/setup-test-app';
import { resetDatabase } from '../setup/reset-database';
import { seedTools } from './seed';




describe('Tools Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  it('returns page 1 with default limit and the full response envelope when no query params are provided', async () => {
    await seedTools(prisma, [
      {
        name: 'Figma',
        vendor: 'Figma Inc.',
        monthlyCost: 150,
        ownerDepartment: 'Design',
        status: 'active',
        description: 'Collaborative design tool',
        websiteUrl: 'https://figma.com',
      },
      {
        name: 'Linear',
        vendor: 'Linear',
        monthlyCost: 29,
        ownerDepartment: 'Engineering',
        status: 'active',
      },
      {
        name: 'Slack',
        vendor: 'Slack Technologies',
        monthlyCost: 12.5,
        ownerDepartment: 'Operations',
        status: 'active',
      },
    ]);

    const res = await request(app.getHttpServer()).get('/api/tools').expect(200);

    expect(res.body.total).toBe(3);
    expect(res.body.filtered).toBe(3);
    expect(res.body.filters_applied).toEqual({});
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 20,
      total_pages: 1,
    });

    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0]).toEqual({
      id: expect.any(Number),
      name: 'Figma',
      description: 'Collaborative design tool',
      vendor: 'Figma Inc.',
      category: 'Design',
      monthly_cost: 150,
      owner_department: 'Design',
      status: 'active',
      website_url: 'https://figma.com',
      active_users_count: 0,
      created_at: expect.any(String),
    });
  });

  it('paginates correctly with page=2&limit=2 when 5 tools exist', async () => {
    await seedTools(prisma, [
      { name: 'Alpha' },
      { name: 'Bravo' },
      { name: 'Charlie' },
      { name: 'Delta' },
      { name: 'Echo' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/tools?page=2&limit=2')
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.map((t: { name: string }) => t.name)).toHaveLength(2);
    expect(res.body.pagination).toEqual({
      page: 2,
      limit: 2,
      total_pages: 3,
    });
    expect(res.body.filtered).toBe(5);
  });

  it('returns an empty data array when page is beyond the last page', async () => {
    await seedTools(prisma, [{ name: 'Alpha' }, { name: 'Bravo' }]);

    const res = await request(app.getHttpServer())
      .get('/api/tools?page=999')
      .expect(200);

    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.page).toBe(999);
  });

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  it('filters by department=Engineering and reports it in filters_applied', async () => {
    await seedTools(prisma, [
      { name: 'EngTool', ownerDepartment: 'Engineering' },
      { name: 'DesignTool', ownerDepartment: 'Design' },
      { name: 'FinanceTool', ownerDepartment: 'Finance' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/tools?department=Engineering')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('EngTool');
    expect(res.body.data[0].owner_department).toBe('Engineering');
    expect(res.body.filtered).toBe(1);
    expect(res.body.total).toBe(3);
    expect(res.body.filters_applied).toEqual({ department: 'Engineering' });
  });

  it('filters by status=active and excludes other statuses', async () => {
    await seedTools(prisma, [
      { name: 'ActiveOne', status: 'active' },
      { name: 'ActiveTwo', status: 'active' },
      { name: 'DeprecatedOne', status: 'deprecated' },
      { name: 'TrialOne', status: 'trial' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/tools?status=active')
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(
      res.body.data.every((t: { status: string }) => t.status === 'active'),
    ).toBe(true);
    expect(res.body.filtered).toBe(2);
  });

  it('filters by cost range min_cost=50&max_cost=100 inclusive on both bounds', async () => {
    await seedTools(prisma, [
      { name: 'Cheap', monthlyCost: 25 },
      { name: 'FiftyExact', monthlyCost: 50 },
      { name: 'Middle', monthlyCost: 75 },
      { name: 'HundredExact', monthlyCost: 100 },
      { name: 'Expensive', monthlyCost: 150 },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/tools?min_cost=50&max_cost=100')
      .expect(200);

    expect(res.body.data).toHaveLength(3);
    const costs = res.body.data
      .map((t: { monthly_cost: number }) => t.monthly_cost)
      .sort((a: number, b: number) => a - b);
    expect(costs).toEqual([50, 75, 100]);
  });

  // ---------------------------------------------------------------------------
  // Sort
  // ---------------------------------------------------------------------------

  it('sorts by name ascending', async () => {
    await seedTools(prisma, [
      { name: 'Zulip' },
      { name: 'Airtable' },
      { name: 'Miro' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/tools?sort=name&order=asc')
      .expect(200);

    const names = res.body.data.map((t: { name: string }) => t.name);
    expect(names).toEqual(['Airtable', 'Miro', 'Zulip']);
    expect(names[0] < names[names.length - 1]).toBe(true);
  });

  it('sorts by cost descending — most expensive tool first', async () => {
    await seedTools(prisma, [
      { name: 'Cheap', monthlyCost: 10 },
      { name: 'Expensive', monthlyCost: 200 },
      { name: 'Mid', monthlyCost: 50 },
    ]);

    const res = await request(app.getHttpServer())
      .get('/api/tools?sort=cost&order=desc')
      .expect(200);

    const costs = res.body.data.map(
      (t: { monthly_cost: number }) => t.monthly_cost,
    );
    expect(costs).toEqual([200, 50, 10]);
  });

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  it('rejects page=-1 with 400', async () => {
    await request(app.getHttpServer()).get('/api/tools?page=-1').expect(400);
  });

  it('rejects limit=0 with 400', async () => {
    await request(app.getHttpServer()).get('/api/tools?limit=0').expect(400);
  });

  // ===========================================================================
  // GET /tools/:id
  // ===========================================================================

  it('returns full tool detail with computed total_monthly_cost and usage_metrics over the last 30 days', async () => {
    const category = await prisma.category.create({ data: { name: 'Design' } });

    const tool = await prisma.tool.create({
      data: {
        name: 'Figma',
        vendor: 'Figma Inc.',
        description: 'Collaborative design tool',
        websiteUrl: 'https://figma.com',
        monthlyCost: 150,
        ownerDepartment: 'Design',
        status: 'active',
        category: { connect: { id: category.id } },
      },
    });

    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@test.local',
        department: 'Engineering',
        role: 'admin',
      },
    });
    const users = await Promise.all(
      [1, 2, 3, 4].map((i) =>
        prisma.user.create({
          data: {
            name: `User ${i}`,
            email: `user${i}@test.local`,
            department: 'Engineering',
          },
        }),
      ),
    );

    await prisma.userToolAccess.createMany({
      data: [
        { userId: users[0].id, toolId: tool.id, grantedBy: admin.id, status: 'active' },
        { userId: users[1].id, toolId: tool.id, grantedBy: admin.id, status: 'active' },
        { userId: users[2].id, toolId: tool.id, grantedBy: admin.id, status: 'active' },
        { userId: users[3].id, toolId: tool.id, grantedBy: admin.id, status: 'revoked' },
      ],
    });

    const daysAgo = (days: number): Date => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - days);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };
    await prisma.usageLog.createMany({
      data: [
        { userId: users[0].id, toolId: tool.id, sessionDate: daysAgo(1), usageMinutes: 30 },
        { userId: users[0].id, toolId: tool.id, sessionDate: daysAgo(5), usageMinutes: 60 },
        { userId: users[1].id, toolId: tool.id, sessionDate: daysAgo(10), usageMinutes: 90 },
        { userId: users[1].id, toolId: tool.id, sessionDate: daysAgo(20), usageMinutes: 120 },
        { userId: users[0].id, toolId: tool.id, sessionDate: daysAgo(45), usageMinutes: 500 },
      ],
    });

    const res = await request(app.getHttpServer())
      .get(`/api/tools/${tool.id}`)
      .expect(200);

    expect(res.body).toEqual({
      id: tool.id,
      name: 'Figma',
      description: 'Collaborative design tool',
      vendor: 'Figma Inc.',
      website_url: 'https://figma.com',
      category: 'Design',
      monthly_cost: 150,
      owner_department: 'Design',
      status: 'active',
      active_users_count: 3,
      total_monthly_cost: 450,
      created_at: expect.any(String),
      updated_at: expect.any(String),
      usage_metrics: {
        last_30_days: {
          total_sessions: 4,
          avg_session_minutes: 75,
        },
      },
    });
  });

  it('returns 404 when the id does not exist', async () => {
    await request(app.getHttpServer()).get('/api/tools/999999').expect(404);
  });


});
