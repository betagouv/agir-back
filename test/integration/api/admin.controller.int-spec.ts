import { DB, TestUtil } from '../../TestUtil';
import { ServiceStatus } from '../../../src/domain/service/service';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { DifficultyLevel } from '../../../src/domain/contenu/difficultyLevel';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { TodoCatalogue } from '../../../src/domain/todo/todoCatalogue';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { CelebrationType } from '../../../src/domain/gamification/celebrations/celebration';
import { Feature } from '../../../src/domain/gamification/feature';
import { LinkyRepository } from '../../../src/infrastructure/repository/linky.repository';
import {
  Chauffage,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';
import { Repas, Consommation } from '../../../src/domain/onboarding/onboarding';
import { TransportQuotidien } from '../../../src/domain/transport/transport';

describe('Admin (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const linkyRepository = new LinkyRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy

    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');

    process.env.EMAIL_ENABLED = 'false';
    process.env.SERVICE_APIS_ENABLED = 'false';
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
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
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335965/services/thermostat-programmable.jpg',
    );
    expect(service.titre).toEqual(`⚡️ ÉcoWatt`);
    expect(service.url).toEqual('https://www.monecowatt.fr/');
    expect(service.icon_url).toEqual(
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335871/services/wtQahY_I8TVLQJ_Rcue7aC-dJ3FfZLNQe84smsyfRa9Qbs1-TG3CJvdrmQ9VUXUVO8vh_w480-h960.png',
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
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335965/services/thermostat-programmable.jpg',
    );
    expect(service.titre).toEqual(`⚡️ ÉcoWatt`);
    expect(service.url).toEqual('https://www.monecowatt.fr/');
    expect(service.icon_url).toEqual(
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335871/services/wtQahY_I8TVLQJ_Rcue7aC-dJ3FfZLNQe84smsyfRa9Qbs1-TG3CJvdrmQ9VUXUVO8vh_w480-h960.png',
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
  it('POST /admin/unsubscribe_oprhan_prms retourne liste des suppressions', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.linky, {
      utilisateurId: '123',
      prm: '111',
      winter_pk: 'abc',
    });

    // WHEN
    const response = await TestUtil.POST('/admin/unsubscribe_oprhan_prms');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toContain('DELETED');
    expect(response.body[0]).toContain('123');
    expect(response.body[0]).toContain('111');
    expect(response.body[0]).toContain('abc');
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
  it('POST /admin/migrate_users migre pas un user qui a pas besoin', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, { version: 2 });
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
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.utilisateur, {
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
  it('POST /admin/migrate_users migration V4 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const gamification: Gamification_v0 = {
      version: 0,
      points: 620,
      celebrations: [
        {
          id: 'celebration-id',
          type: CelebrationType.niveau,
          new_niveau: 2,
          titre: 'the titre',
          reveal: {
            id: 'reveal-id',
            feature: Feature.aides,
            titre: 'Les aides !',
            description: 'bla',
          },
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      version: 3,
      migration_enabled: true,
      gamification: gamification,
    });
    process.env.USER_CURRENT_VERSION = '4';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.version).toBe(4);
    expect(userDB.unlocked_features.isUnlocked(Feature.bibliotheque)).toEqual(
      true,
    );
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 4,
            ok: true,
            info: `revealed bilbio for user utilisateur-id of 620 points : true`,
          },
        ],
      },
    ]);
  });
  it('POST /admin/migrate_users migration V5 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      version: 4,
      migration_enabled: true,
      logement: {},
    });
    process.env.USER_CURRENT_VERSION = '5';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 5,
            ok: true,
            info: `migrated logement data`,
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.version).toBe(5);
    expect(userDB.logement.type).toEqual(TypeLogement.maison);
    expect(userDB.logement.chauffage).toEqual(Chauffage.bois);
    expect(userDB.logement.code_postal).toEqual('91120');
    expect(userDB.logement.commune).toEqual('PALAISEAU');
    expect(userDB.logement.dpe).toEqual(undefined);
    expect(userDB.logement.nombre_adultes).toEqual(2);
    expect(userDB.logement.nombre_enfants).toEqual(1);
    expect(userDB.logement.plus_de_15_ans).toEqual(undefined);
    expect(userDB.logement.proprietaire).toEqual(true);
    expect(userDB.logement.superficie).toEqual(Superficie.superficie_100);
  });
  it('POST /admin/migrate_users migration V6 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      version: 5,
      migration_enabled: true,
      logement: {},
    });
    process.env.USER_CURRENT_VERSION = '6';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 6,
            ok: true,
            info: `migrated transport data`,
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.version).toBe(6);
    expect(userDB.transport.avions_par_an).toEqual(2);
    expect(userDB.transport.transports_quotidiens).toEqual([
      TransportQuotidien.voiture,
      TransportQuotidien.pied,
    ]);
  });
  it('POST /admin/lock_user_migration lock les utilisateur', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      migration_enabled: true,
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      migration_enabled: true,
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
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
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(0);
  });
  it('POST /services/clean_linky_data appel ok si aucune donnee linky', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/services/clean_linky_data');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ result: 'Cleaned 0 PRMs' });
  });
  it('POST /services/clean_linky_data clean ok', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.linky, {
      prm: 'abc',
      winter_pk: '111',
      utilisateurId: '1',
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
    await TestUtil.create(DB.linky, {
      prm: 'efg',
      utilisateurId: '2',
      winter_pk: '222',
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
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ result: 'Cleaned 2 PRMs' });
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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'dummy_async',
    });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'dummy_async',
      status: 'LIVE',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('service-id');
  });
  it('POST /services/process_async_service appel ok, renvoi id info service linky deja LIVE', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      status: 'LIVE',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ALREADY LIVE : linky - service-id | data_email:false',
    );
  });
  it('POST /services/process_async_service appel ok, 2 service linky LIVE', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, { id: '1', email: 'a' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: 'b' });
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
      id: '123',
      utilisateurId: '1',
      serviceDefinitionId: 'linky',
      status: 'LIVE',
    });
    await TestUtil.create(DB.service, {
      id: '456',
      utilisateurId: '2',
      serviceDefinitionId: 'linky',
      status: 'LIVE',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
  });
  it('POST /services/process_async_service appel ok, status inconnu', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      status: 'blurp',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'UNKNOWN STATUS : linky - service-id - blurp | data_email:false',
    );
  });
  it('POST /services/process_async_service appel ok, prm manquant', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.WINTER_API_ENABLED = 'false';

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      status: 'CREATED',
    });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ERROR : linky - service-id : missing prm data | data_email:false',
    );
  });
  it('POST /services/process_async_service appel ok, CREATED delcenche traitement pour linky', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.WINTER_API_ENABLED = 'false';

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
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
    expect(response.status).toBe(201);
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

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
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
    expect(response.status).toBe(201);
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
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      'ALREADY LIVE : linky - service-id | data_email:false',
    );
    expect(serviceDB.configuration['sent_data_email']).toBeUndefined();

    // WHEN
    await linkyRepository.upsertDataForPRM('123', [
      {
        time: new Date(),
        value: 12,
        value_at_normal_temperature: 14,
      },
    ]);

    // WHEN
    response = await TestUtil.POST('/services/process_async_service');

    // THEN
    serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(response.status).toBe(201);
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
    expect(response.status).toBe(201);
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

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
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
    expect(response.status).toBe(201);
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

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
    });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      status: 'TO_DELETE',
      configuration: { prm: '123', winter_pk: 'abc' },
    });
    await TestUtil.create(DB.linky, { prm: '123' });

    // WHEN
    const response = await TestUtil.POST('/services/process_async_service');

    // THEN
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    const linkyDB = await TestUtil.prisma.linky.findUnique({
      where: { prm: '123' },
    });
    expect(response.status).toBe(201);
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
    await TestUtil.create(DB.serviceDefinition, {
      id: 'dummy_scheduled',
      scheduled_refresh: new Date(Date.now() - 1000),
      minute_period: 30,
    });

    // WHEN
    const response = await TestUtil.POST('/services/refresh_dynamic_data');

    // THEN
    const serviceDefDB = await TestUtil.prisma.serviceDefinition.findFirst();

    expect(response.status).toBe(201);
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
    await TestUtil.create(DB.serviceDefinition, {
      id: 'dummy_scheduled',
      scheduled_refresh: null,
      minute_period: 30,
    });

    // WHEN
    const response = await TestUtil.POST('/services/refresh_dynamic_data');

    // THEN
    const serviceDefDB = await TestUtil.prisma.serviceDefinition.findFirst();

    expect(response.status).toBe(201);
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
    process.env.ADMIN_IDS = '';
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, {
      id: 'dummy_scheduled',
      scheduled_refresh: new Date(Date.now() - 1000),
      minute_period: 30,
    });
    await TestUtil.create(DB.service, {
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
  it('POST /admin/upgrade_user_todo complète la todo des utilisateurs', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.utilisateur, {
      email: '1',
      todo: {
        liste_todo: [
          {
            numero_todo: 1,
            points_todo: 25,
            done: [],
            todo: [
              {
                titre: 'faire quizz climat',
                thematiques: [Thematique.climat],
                progression: { current: 0, target: 1 },
                sont_points_en_poche: false,
                type: 'quizz',
                level: DifficultyLevel.L1,
                points: 10,
              },
            ],
          },
        ],
        todo_active: 0,
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'user-2',
      email: '2',
      todo: {
        liste_todo: TodoCatalogue.getAllTodos(),
        todo_active: 0,
      },
    });

    // WHEN
    const response = await TestUtil.POST('/admin/upgrade_user_todo');

    // THEN
    const userDB_1 = await utilisateurRepository.getById('utilisateur-id');
    const userDB_2 = await utilisateurRepository.getById('utilisateur-id');
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
    expect(response.body).toContain(`utilisateur utilisateur-id : true`);
    expect(response.body).toContain(`utilisateur user-2 : false`);
    expect(userDB_1.parcours_todo.todo_active).toEqual(0);
    expect(userDB_2.parcours_todo.liste_todo).toHaveLength(
      TodoCatalogue.getNombreTodo(),
    );
  });
  it('POST /utilisateurs/compute_reco_tags - recalcul les tags de reco', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      onboardingData: {
        version: 0,
        transports: [TransportQuotidien.pied, TransportQuotidien.voiture],
        avion: 2,
        code_postal: '91120',
        adultes: 2,
        enfants: 1,
        residence: TypeLogement.maison,
        proprietaire: true,
        superficie: Superficie.superficie_100,
        chauffage: Chauffage.bois,
        repas: Repas.tout,
        consommation: Consommation.raisonnable,
        commune: 'PALAISEAU',
      },
    });

    const userDB_before = await utilisateurRepository.getById('utilisateur-id');

    // WHEN
    const response = await TestUtil.POST('/admin/compute_reco_tags');

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB_before.tag_ponderation_set.utilise_moto_ou_voiture).toEqual(
      undefined,
    );
    expect(userDB.tag_ponderation_set.utilise_moto_ou_voiture).toEqual(100);
  });
  it('POST /admin/contacts/synchronize - synchro user dans Brevo', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST('/admin/contacts/synchronize');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('utilisateur-id');
  });

  it("POST /admin/statistique - calcul des statistiques de l'ensemble des utilisateurs", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, { id: 'test-id-1' });
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-2',
      email: 'user-email@toto.fr',
    });

    // WHEN
    const response = await TestUtil.POST('/admin/statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
    expect(response.body.includes('test-id-1')).toEqual(true);
    expect(response.body.includes('test-id-2')).toEqual(true);

    const nombreDeLignesTableStatistique =
      await TestUtil.prisma.statistique.findMany();
    expect(nombreDeLignesTableStatistique).toHaveLength(2);
  });

  it("POST /admin/article-statistique - calcul des statistiques de l'ensemble des articles", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-1',
      history: {
        version: 0,
        article_interactions: [
          {
            content_id: 'article-id-1',
            read_date: new Date(),
            like_level: 3,
            points_en_poche: false,
            favoris: true,
          },
        ],
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-2',
      email: 'user-email@toto.fr',
      history: {
        version: 0,
        article_interactions: [
          {
            content_id: 'article-id-1',
            read_date: new Date(),
            like_level: 4,
            points_en_poche: false,
            favoris: true,
          },
          {
            content_id: 'article-id-2',
            read_date: new Date(),
            like_level: 2,
            points_en_poche: false,
            favoris: true,
          },
          {
            content_id: 'article-id-3',
            read_date: new Date(),
            like_level: undefined,
            points_en_poche: false,
            favoris: false,
          },
        ],
        quizz_interactions: [],
      },
    });

    // WHEN
    const response = await TestUtil.POST('/admin/article-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual([
      'article-id-1',
      'article-id-2',
      'article-id-3',
    ]);

    const nombreDeLignesTableStatistique =
      await TestUtil.prisma.articleStatistique.findMany();
    const ratingArticle1 = await TestUtil.prisma.articleStatistique.findUnique({
      where: { articleId: 'article-id-1' },
    });
    const ratingArticle2 = await TestUtil.prisma.articleStatistique.findUnique({
      where: { articleId: 'article-id-2' },
    });
    const ratingArticle3 = await TestUtil.prisma.articleStatistique.findUnique({
      where: { articleId: 'article-id-3' },
    });

    expect(nombreDeLignesTableStatistique).toHaveLength(3);

    expect(ratingArticle1.rating.toString()).toBe('3.5');
    expect(ratingArticle2.rating.toString()).toBe('2');
    expect(ratingArticle3.rating).toBeNull();

    expect(ratingArticle1.nombre_de_mise_en_favoris).toBe(2);
    expect(ratingArticle2.nombre_de_mise_en_favoris).toBe(1);
    expect(ratingArticle3.nombre_de_mise_en_favoris).toBe(0);
  });
});
