import { TestUtil } from '../../TestUtil';

describe('Admin (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy

    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('POST /admin/lock_user_migration retourne une 403 si pas le bon id d utilisateur', async () => {
    // GIVEN
    await TestUtil.generateAuthorizationToken('bad_id');

    // WHEN
    const response = await TestUtil.POST('/admin/lock_user_migration');

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /admin/lock_user_migration retourne une 200 si utilisateur est admin', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/admin/lock_user_migration');

    // THEN
    expect(response.status).toBe(201);
  });
  it('POST /admin/migrate_users retourne une 200 si pas de user en base', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([]);
  });
  it('POST /admin/migrate_users retourne migre pas un user qui a pas besoin', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur', { version: 2 });
    process.env.USER_CURRENT_VERSION = '2';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(userDB.version).toBe(2);
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [],
      },
    ]);
  });
  it(`POST /admin/migrate_users verifie si migration active pour l'utilisateur`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur', {
      version: 2,
      migration_enabled: false,
    });
    process.env.USER_CURRENT_VERSION = '3';
    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(userDB.version).toBe(2);
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 3,
            ok: true,
            info: 'Migrations disable for that user',
          },
        ],
      },
    ]);
  });
  it('POST /admin/migrate_users migration manquante', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur', {
      version: 100,
      migration_enabled: true,
    });
    process.env.USER_CURRENT_VERSION = '101';
    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(response.status).toBe(201);
    expect(userDB.version).toBe(100);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 101,
            ok: false,
            info: 'Missing migration implementation !',
          },
        ],
      },
    ]);
  });
  it('POST /admin/migrate_users premiere migration bidon OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur', {
      version: 0,
      migration_enabled: true,
    });
    process.env.USER_CURRENT_VERSION = '1';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(userDB.version).toBe(1);
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 1,
            ok: true,
            info: 'dummy migration',
          },
        ],
      },
    ]);
  });
  it('POST /admin/lock_user_migration lock les utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('utilisateur', {
      id: '1',
      migration_enabled: true,
      email: '1',
    });
    await TestUtil.create('utilisateur', {
      id: '2',
      migration_enabled: true,
      email: '2',
    });

    // WHEN
    const response = await TestUtil.POST('/admin/lock_user_migration');

    // THEN
    expect(response.status).toBe(201);
    const userDB = await TestUtil.prisma.utilisateur.findMany({});
    expect(userDB[0].migration_enabled).toStrictEqual(false);
    expect(userDB[1].migration_enabled).toStrictEqual(false);
  });
  it('POST /admin/unlock_user_migration lock les utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('utilisateur', {
      id: '1',
      migration_enabled: true,
      email: '1',
    });
    await TestUtil.create('utilisateur', {
      id: '2',
      migration_enabled: true,
      email: '2',
    });

    // WHEN
    const response = await TestUtil.POST('/admin/unlock_user_migration');

    // THEN
    expect(response.status).toBe(201);
    const userDB = await TestUtil.prisma.utilisateur.findMany({});
    expect(userDB[0].migration_enabled).toStrictEqual(true);
    expect(userDB[1].migration_enabled).toStrictEqual(true);
  });
});
