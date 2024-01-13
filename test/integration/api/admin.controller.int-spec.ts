import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';

describe('Admin (API test)', () => {
  const OLD_ENV = process.env;
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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
            info: 'Migrations disabled for that user',
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

  it('POST /admin/migrate_users migration 2 articles', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur', {
      version: 1,
      migration_enabled: true,
      history: {},
    });
    process.env.USER_CURRENT_VERSION = '2';

    await TestUtil.create('interaction', {
      id: 'i1',
      type: InteractionType.article,
      done: true,
      content_id: '1',
      done_at: new Date(123),
      like_level: 1,
      points_en_poche: false,
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      type: InteractionType.article,
      done: true,
      content_id: '2',
      done_at: new Date(456),
      like_level: 2,
      points_en_poche: true,
    });
    await TestUtil.create('interaction', {
      id: 'i3',
      type: InteractionType.article,
      done: false,
      content_id: '3',
    });
    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(response.status).toBe(201);
    expect(
      userDB.history.getArticleHistoryById('1').read_date.getTime(),
    ).toEqual(new Date(123).getTime());
    expect(userDB.history.getArticleHistoryById('1').like_level).toEqual(1);
    expect(userDB.history.getArticleHistoryById('1').points_en_poche).toEqual(
      false,
    );
    expect(
      userDB.history.getArticleHistoryById('2').read_date.getTime(),
    ).toEqual(new Date(456).getTime());
    expect(userDB.history.getArticleHistoryById('2').like_level).toEqual(2);
    expect(userDB.history.getArticleHistoryById('2').points_en_poche).toEqual(
      true,
    );

    expect(userDB.history.getArticleHistoryById('3')).toBeUndefined();

    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 2,
            ok: true,
            info: `- migrated 2 articles to user hisotry
- migrated 0 quizzes to user hisotry`,
          },
        ],
      },
    ]);
  });
  it('POST /admin/migrate_users migration 2 quizz', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur', {
      version: 1,
      migration_enabled: true,
      history: {},
    });
    process.env.USER_CURRENT_VERSION = '2';

    await TestUtil.create('interaction', {
      id: 'i1',
      type: InteractionType.quizz,
      done: true,
      quizz_score: 50,
      content_id: '1',
      done_at: new Date(123),
      like_level: 1,
      points_en_poche: false,
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      type: InteractionType.quizz,
      done: true,
      quizz_score: 100,
      content_id: '2',
      done_at: new Date(456),
      like_level: 2,
      points_en_poche: true,
    });
    await TestUtil.create('interaction', {
      id: 'i3',
      type: InteractionType.quizz,
      done: false,
      content_id: '3',
    });
    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(response.status).toBe(201);
    expect(
      userDB.history.getQuizzHistoryById('1').attempts[0].date.getTime(),
    ).toEqual(new Date(123).getTime());
    expect(userDB.history.getQuizzHistoryById('1').attempts[0].score).toEqual(
      50,
    );
    expect(userDB.history.getQuizzHistoryById('1').like_level).toEqual(1);
    expect(userDB.history.getQuizzHistoryById('1').points_en_poche).toEqual(
      false,
    );
    expect(
      userDB.history.getQuizzHistoryById('2').attempts[0].date.getTime(),
    ).toEqual(new Date(456).getTime());
    expect(userDB.history.getQuizzHistoryById('2').attempts[0].score).toEqual(
      100,
    );
    expect(userDB.history.getQuizzHistoryById('2').like_level).toEqual(2);
    expect(userDB.history.getQuizzHistoryById('2').points_en_poche).toEqual(
      true,
    );
    expect(userDB.history.getQuizzHistoryById('3')).toBeUndefined();

    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 2,
            ok: true,
            info: `- migrated 0 articles to user hisotry
- migrated 2 quizzes to user hisotry`,
          },
        ],
      },
    ]);
  });

  it('POST /services/refresh_dynamic_data 401 si pas header authorization', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer().post(
      '/services/refresh_dynamic_data',
    );

    // THEN
    expect(response.status).toBe(401);
  });
  it('POST /services/refresh_dynamic_data 403 si mauvais token', async () => {
    // GIVEN
    TestUtil.token = 'bad';

    // WHEN
    const response = await TestUtil.POST('/services/refresh_dynamic_data');

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /services/refresh_dynamic_data appel ok, renvoie liste vide quand aucun service en base', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/services/refresh_dynamic_data');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('POST /services/refresh_dynamic_data appel ok, renvoie 1 quand 1 service cible, donnée mises à jour', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('serviceDefinition', {
      id: 'dummy_scheduled',
      scheduled_refresh: new Date(Date.now() - 1000),
      minute_period: 30,
    });

    // WHEN
    const response = await TestUtil.POST('/services/refresh_dynamic_data');

    // THEN
    const serviceDefDB = await TestUtil.prisma.serviceDefinition.findFirst();

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('REFRESHED OK : dummy_scheduled');
    expect(serviceDefDB.dynamic_data['label']).toEqual('En construction 🚧');
    expect(
      Math.round(
        (serviceDefDB.scheduled_refresh.getTime() - Date.now()) / 1000,
      ),
    ).toEqual(30 * 60);
  });
  it('POST /services/refresh_dynamic_data appel ok, renvoie 1 quand 1 service cible avec period de refresh, mais pas de scheduled_refresh, donnée mises à jour', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('serviceDefinition', {
      id: 'dummy_scheduled',
      scheduled_refresh: null,
      minute_period: 30,
    });

    // WHEN
    const response = await TestUtil.POST('/services/refresh_dynamic_data');

    // THEN
    const serviceDefDB = await TestUtil.prisma.serviceDefinition.findFirst();

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('REFRESHED OK : dummy_scheduled');
    expect(serviceDefDB.dynamic_data['label']).toEqual('En construction 🚧');
    expect(
      Math.round(
        (serviceDefDB.scheduled_refresh.getTime() - Date.now()) / 1000,
      ),
    ).toEqual(30 * 60);
  });
  it('POST /services/refresh_dynamic_data puis GET /utilisateurs/id/services appel récupère les données calculées en schedule', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'dummy_scheduled',
      scheduled_refresh: new Date(Date.now() - 1000),
      minute_period: 30,
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'dummy_scheduled',
    });

    // WHEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.POST('/services/refresh_dynamic_data');

    await TestUtil.generateAuthorizationToken('utilisateur-id');
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].label).toEqual('En construction 🚧');
  });
});
