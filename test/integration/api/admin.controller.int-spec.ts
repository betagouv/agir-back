import { TestUtil } from '../../TestUtil';

describe('Admin (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /admin/insert_service_definitions retourne une 403 si pas le bon id d utilisateur', async () => {
    // GIVEN
    await TestUtil.generateAuthorizationToken('bad_id');

    // WHEN
    const response = await TestUtil.POST('/admin/insert_service_definitions');

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /admin/insert_service_definitions retourne une 200 si utilisateur est admin', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.POST('/admin/insert_service_definitions');

    // THEN
    const listDB = await TestUtil.prisma.serviceDefinition.findMany();
    expect(response.status).toBe(201);
    expect(listDB).toHaveLength(5);
  });
});
