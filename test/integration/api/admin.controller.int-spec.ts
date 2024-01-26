import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';
import { ServiceStatus } from '../../../src/domain/service/service';
import { LinkyDataElement } from 'src/domain/linky/linkyData';

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

  it('POST /admin/upsert_service_definitions integre correctement les services', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/admin/upsert_service_definitions');

    // THEN
    expect(response.status).toBe(201);

    const services = await TestUtil.prisma.serviceDefinition.findMany();
    expect(services).toHaveLength(5);

    const service = await TestUtil.prisma.serviceDefinition.findUnique({
      where: { id: 'ecowatt' },
    });
    expect(service.image_url).toEqual(
      'https://agirpourlatransition.ademe.fr/particuliers/sites/default/files/styles/550x330/public/2022-03/thermostat-programmable.jpg?itok=4HIKhFAI',
    );
    expect(service.titre).toEqual(`⚡️ ÉcoWatt`);
    expect(service.url).toEqual('https://www.monecowatt.fr/');
    expect(service.icon_url).toEqual(
      'https://play-lh.googleusercontent.com/wtQahY_I8TVLQJ_Rcue7aC-dJ3FfZLNQe84smsyfRa9Qbs1-TG3CJvdrmQ9VUXUVO8vh=w480-h960',
    );
    expect(service.is_url_externe).toEqual(true);
    expect(service.is_local).toEqual(false);
    expect(service.thematiques).toEqual(['logement']);
    expect(service.minute_period).toEqual(30);
    expect(service.description).toEqual(
      'Ecowatt aide les Français à mieux consommer l’électricité.',
    );
    expect(service.sous_description).toEqual(
      'Véritable météo de l’électricité, Ecowatt qualifie en temps réel le niveau de consommation des Français.',
    );
  });
  it('POST /admin/upsert_service_definitions integre correctement les services', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/admin/upsert_service_definitions');

    // THEN
    expect(response.status).toBe(201);

    const services = await TestUtil.prisma.serviceDefinition.findMany();
    expect(services).toHaveLength(5);

    const service = await TestUtil.prisma.serviceDefinition.findUnique({
      where: { id: 'ecowatt' },
    });
    expect(service.image_url).toEqual(
      'https://agirpourlatransition.ademe.fr/particuliers/sites/default/files/styles/550x330/public/2022-03/thermostat-programmable.jpg?itok=4HIKhFAI',
    );
    expect(service.titre).toEqual(`⚡️ ÉcoWatt`);
    expect(service.url).toEqual('https://www.monecowatt.fr/');
    expect(service.icon_url).toEqual(
      'https://play-lh.googleusercontent.com/wtQahY_I8TVLQJ_Rcue7aC-dJ3FfZLNQe84smsyfRa9Qbs1-TG3CJvdrmQ9VUXUVO8vh=w480-h960',
    );
    expect(service.is_url_externe).toEqual(true);
    expect(service.is_local).toEqual(false);
    expect(service.thematiques).toEqual(['logement']);
    expect(service.minute_period).toEqual(30);
    expect(service.description).toEqual(
      'Ecowatt aide les Français à mieux consommer l’électricité.',
    );
    expect(service.sous_description).toEqual(
      'Véritable météo de l’électricité, Ecowatt qualifie en temps réel le niveau de consommation des Français.',
    );
  });
  it('POST /admin/upsert_ponderations integre correctement les ponderations', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/admin/upsert_ponderations');

    // THEN
    expect(response.status).toBe(201);

    const ponderations = await TestUtil.prisma.ponderation.findMany();
    expect(ponderations).toHaveLength(1);

    const ponderation = await TestUtil.prisma.ponderation.findUnique({
      where: { id: 'noel' },
    });
    expect(ponderation.id).toEqual('noel');
    expect(ponderation.rubriques).toEqual({
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0,
      '10': 0,
      '11': 0,
      '12': 0,
      '13': 0,
      '14': 0,
      '15': 0,
      '16': 0,
      '17': 0,
      '18': 0,
      '19': 0,
      '20': 0,
      '21': 0,
      '22': 0,
      '23': 0,
      '24': 0,
      '25': 0,
      '26': 0,
      '27': 0,
      '28': 0,
      '29': 0,
      '30': 0,
      '31': 0,
      '32': 10,
      '33': 10,
      '34': 10,
      '35': 10,
      '36': 10,
    });
  });
  it('POST /admin/lock_user_migration retourne une 403 si pas le bon id d utilisateur', async () => {
    // GIVEN
    await TestUtil.generateAuthorizationToken('bad_id');

    // WHEN
    const response = await TestUtil.POST('/admin/lock_user_migration');

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /admin/lock_user_migration retourne une 200 si API CRON', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

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
    TestUtil.token = process.env.CRON_API_KEY;
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
    TestUtil.token = process.env.CRON_API_KEY;
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
  it('POST /services/clean_linky_data appel ok si aucune donnee linky', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/services/clean_linky_data');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual('Cleaned 0 PRMs');
  });
  it('POST /services/clean_linky_data appel ok si aucune donnee linky', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('linky', {
      prm: 'abc',
      data: [
        {
          time: new Date(123),
          value: 100,
          value_at_normal_temperature: 0,
        },
        {
          time: new Date(123),
          value: 110,
          value_at_normal_temperature: 0,
        },
      ],
    });
    await TestUtil.create('linky', {
      prm: 'efg',
      data: [
        {
          time: new Date(456),
          value: 210,
          value_at_normal_temperature: 0,
        },
        {
          time: new Date(123),
          value: 200,
          value_at_normal_temperature: 0,
        },
      ],
    });
    // WHEN
    const response = await TestUtil.POST('/services/clean_linky_data');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual('Cleaned 2 PRMs');
    const linky_abc = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    const linky_efg = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'efg' },
    });
    expect(linky_abc.data).toHaveLength(1);
    expect(linky_abc.data[0].value).toEqual(110);
    expect(linky_efg.data).toHaveLength(2);
    expect(linky_efg.data[0].value).toEqual(200);
    expect(linky_efg.data[1].value).toEqual(210);
  });
  it('POST /services/process_async_service appel ok, renvoi id du service traité', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'dummy_async',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'dummy_async',
      status: 'LIVE',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('service-id');
  });
  it('POST /services/process_async_service appel ok, renvoi id info service linky deja LIVE', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: 'LIVE',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ALREADY LIVE : linky - service-id | data_email:false',
    );
  });
  it('POST /services/process_async_service appel ok, 2 service linky LIVE', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur', { id: '1', email: 'a' });
    await TestUtil.create('utilisateur', { id: '2', email: 'b' });
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      id: '123',
      utilisateurId: '1',
      serviceDefinitionId: 'linky',
      status: 'LIVE',
    });
    await TestUtil.create('service', {
      id: '456',
      utilisateurId: '2',
      serviceDefinitionId: 'linky',
      status: 'LIVE',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('POST /services/process_async_service appel ok, status inconnu', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: 'blurp',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'UNKNOWN STATUS : linky - service-id - blurp | data_email:false',
    );
  });
  it('POST /services/process_async_service appel ok, prm manquant', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.WINTER_API_ENABLED = 'false';

    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: 'CREATED',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ERROR : linky - service-id : missing prm data | data_email:false',
    );
  });
  it('POST /services/process_async_service appel ok, CREATED delcenche traitement pour linky', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.WINTER_API_ENABLED = 'false';

    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: 'CREATED',
      configuration: { prm: '123' },
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'INITIALISED : linky - service-id - prm:123 | data_email:false',
    );
    expect(serviceDB.status).toEqual(ServiceStatus.LIVE);
    expect(serviceDB.configuration['prm']).toEqual('123');
    expect(serviceDB.configuration['live_prm']).toEqual('123');
    expect(serviceDB.configuration['winter_pk']).toEqual('fake_winter_pk');
  });
  it('POST /services/process_async_service appel ok, la presence de donnee declenche une unique fois envoi de mail data', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.WINTER_API_ENABLED = 'false';

    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: 'CREATED',
      configuration: { prm: '123' },
    });

    // WHEN
    let response = await TestUtil.POST('/services/process_async_service');

    // THEN
    let serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'INITIALISED : linky - service-id - prm:123 | data_email:false',
    );
    expect(serviceDB.configuration['sent_data_email']).toBeUndefined();

    // WHEN
    response = await TestUtil.POST('/services/process_async_service');

    // THEN
    serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ALREADY LIVE : linky - service-id | data_email:false',
    );
    expect(serviceDB.configuration['sent_data_email']).toBeUndefined();

    // WHEN
    await TestUtil.prisma.linky.create({
      data: {
        prm: '123',
        data: [
          {
            time: new Date(),
            value: 12,
            value_at_normal_temperature: 14,
          },
        ],
      },
    });

    // WHEN
    response = await TestUtil.POST('/services/process_async_service');

    // THEN
    serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ALREADY LIVE : linky - service-id | data_email:true',
    );
    expect(serviceDB.configuration['sent_data_email']).toEqual(true);

    // WHEN
    response = await TestUtil.POST('/services/process_async_service');

    // THEN
    serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ALREADY LIVE : linky - service-id | data_email:false',
    );
    expect(serviceDB.configuration['sent_data_email']).toEqual(true);
  });
  it('POST /services/process_async_service appel ok, CREATED avec un ancien PRM live retourn qu il est deja live', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.WINTER_API_ENABLED = 'false';

    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: 'CREATED',
      configuration: { prm: '123', live_prm: '123' },
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    const linkyDB = await TestUtil.prisma.linky.findUnique({
      where: { prm: '123' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'PREVIOUSLY LIVE : linky - service-id - prm:123 | data_email:false',
    );
    expect(serviceDB.status).toEqual(ServiceStatus.LIVE);
    expect(serviceDB.configuration['prm']).toEqual('123');
    expect(serviceDB.configuration['live_prm']).toEqual('123');
    expect(linkyDB).toBeNull(); // pas de recreation, ça existe a priori déjà
  });
  it('POST /services/process_async_service appel ok, supprime le serice linky OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.WINTER_API_ENABLED = 'false';

    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: 'TO_DELETE',
      configuration: { prm: '123', winter_pk: 'abc' },
    });
    await TestUtil.create('linky', { prm: '123' });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    const linkyDB = await TestUtil.prisma.linky.findUnique({
      where: { prm: '123' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'DELETED : linky - service-id - prm:123 | data_email:false',
    );
    expect(serviceDB).toBeNull();
    expect(linkyDB).toBeNull();
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
