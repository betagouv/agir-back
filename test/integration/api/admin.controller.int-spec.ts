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
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';
import { DefiStatus } from '../../../src/domain/defis/defi';
import {
  DefiHistory_v0,
  Defi_v0,
} from '../../../src/domain/object_store/defi/defiHistory_v0';
import { Univers } from '../../../src/domain/univers/univers';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ContentType } from '../../../src/domain/contenu/contentType';
import {
  MissionsUtilisateur_v0,
  Objectif_v0,
} from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ParcoursTodo_v0 } from '../../../src/domain/object_store/parcoursTodo/parcoursTodo_v0';
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';

describe('Admin (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const linkyRepository = new LinkyRepository(TestUtil.prisma);
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

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
      'Véritable météo de l’électricité, Ecowatt mesure le niveau de consommation des Français au jour le jour et vous propose des conseils pour réduire votre impact et optimiser votre utilisation.',
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
      'Véritable météo de l’électricité, Ecowatt mesure le niveau de consommation des Français au jour le jour et vous propose des conseils pour réduire votre impact et optimiser votre utilisation.',
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
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
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

  it('POST /admin/migrate_users migration V7 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          points: 5,
          tags: [],
          titre: 'titre',
          thematique: Thematique.alimentation,
          astuces: 'astuce',
          date_acceptation: new Date(),
          pourquoi: 'pourquoi',
          sous_titre: 'sous_titre',
          universes: [Univers.climat],
          accessible: true,
          motif: 'truc',
          id: '001',
          status: DefiStatus.deja_fait,
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
          sont_points_en_poche: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      version: 6,
      migration_enabled: true,
      logement: {},
      defis: defis,
    });
    process.env.USER_CURRENT_VERSION = '7';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 7,
            ok: true,
            info: `user : utilisateur-id switched 1 status deja_fait => fait`,
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.defi_history.defis[0].getStatus()).toEqual(DefiStatus.fait);
  });
  it('POST /admin/migrate_users migration V8 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const kyc = {
      version: 0,
      answered_questions: [
        {
          id: KYCID._2,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
          ],
          tags: [],
          universes: [Univers.climat],
        },
      ],
    };
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
    });

    await TestUtil.create(DB.utilisateur, {
      version: 7,
      migration_enabled: true,
      kyc: kyc,
    });
    process.env.USER_CURRENT_VERSION = '8';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 8,
            ok: true,
            info: `CMS IDS injected [1]`,
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.kyc_history.answered_questions[0].id_cms).toEqual(1);
  });
  it('POST /admin/migrate_users migration V10 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.utilisateur, {
      version: 9,
      migration_enabled: true,
    });
    process.env.USER_CURRENT_VERSION = '10';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 10,
            ok: true,
            info: 'migrated points/code_postal/commune pour classement',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.code_postal_classement).toEqual('91120');
    expect(userDB.commune_classement).toEqual('PALAISEAU');
    expect(userDB.points_classement).toEqual(10);
  });
  it('POST /admin/migrate_users migration V11 OK - user ayant pas fini les mission onboarding', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const todo: ParcoursTodo_v0 = ParcoursTodo_v0.serialise(new ParcoursTodo());
    todo.todo_active = 1;

    await TestUtil.create(DB.utilisateur, {
      version: 10,
      migration_enabled: true,
      todo: todo,
    });
    process.env.USER_CURRENT_VERSION = '11';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 11,
            ok: true,
            info: 'reset user car todo pas terminée',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.parcours_todo.todo_active).toEqual(0);
    expect(userDB.unlocked_features.unlocked_features).toEqual([
      Feature.univers,
    ]);
  });
  it.skip('POST /admin/migrate_users migration V11 OK - user ayant fini les mission onboarding', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const todo: ParcoursTodo_v0 = ParcoursTodo_v0.serialise(new ParcoursTodo());
    todo.todo_active = 3;

    await TestUtil.create(DB.utilisateur, {
      version: 10,
      migration_enabled: true,
      todo: todo,
    });
    process.env.USER_CURRENT_VERSION = '11';

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 11,
            ok: true,
            info: 'no reset, todo terminée',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.parcours_todo.todo_active).toEqual(3);
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
          date: new Date(123),
          value: 100,
        },
        {
          date: new Date(123),
          value: 110,
        },
      ],
    });
    await TestUtil.create(DB.linky, {
      prm: 'efg',
      utilisateurId: '2',
      winter_pk: '222',
      data: [
        {
          date: new Date(456),
          value: 210,
        },
        {
          date: new Date(123),
          value: 200,
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
        date: new Date(),
        day_value: 12,
        value_cumulee: null,
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
  it.skip('POST /services/refresh_dynamic_data puis GET /utilisateurs/id/services appel récupère les données calculées en schedule', async () => {
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
    const userDB_1 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    const userDB_2 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
    expect(response.body).toContain(`utilisateur utilisateur-id : true`);
    expect(response.body).toContain(`utilisateur user-2 : false`);
    expect(userDB_1.parcours_todo.todo_active).toEqual(0);
    expect(userDB_2.parcours_todo.liste_todo).toHaveLength(
      TodoCatalogue.getNombreTodo(),
    );
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
    const DEFI: Defi_v0 = {
      id: '1',
      points: 10,
      tags: [],
      titre: 'titre',
      thematique: Thematique.transport,
      astuces: 'ASTUCE',
      date_acceptation: null,
      pourquoi: 'POURQUOI',
      sous_titre: 'SOUS TITRE',
      status: DefiStatus.todo,
      universes: [Univers.climat],
      accessible: true,
      motif: 'truc',
      categorie: Categorie.recommandation,
      mois: [],
      conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
      sont_points_en_poche: false,
    };
    const defis_1: DefiHistory_v0 = {
      version: 0,
      defis: [
        { ...DEFI, id: '1', status: DefiStatus.pas_envie, titre: 'A' },
        { ...DEFI, id: '2', status: DefiStatus.abondon, titre: 'B' },
        { ...DEFI, id: '3', status: DefiStatus.fait, titre: 'C' },
        { ...DEFI, id: '1', status: DefiStatus.pas_envie, titre: 'E' },
        { ...DEFI, id: '2', status: DefiStatus.abondon, titre: 'F' },
        { ...DEFI, id: '3', status: DefiStatus.en_cours, titre: 'G' },
      ],
    };
    const defis_2: DefiHistory_v0 = {
      version: 0,
      defis: [
        { ...DEFI, id: '1', status: DefiStatus.pas_envie, titre: 'A' },
        { ...DEFI, id: '2', status: DefiStatus.abondon, titre: 'B' },
        { ...DEFI, id: '3', status: DefiStatus.fait, titre: 'C' },
      ],
    };
    const objectifComplete: Objectif_v0 = {
      id: '1',
      content_id: '12',
      type: ContentType.article,
      titre: 'Super article',
      points: 10,
      is_locked: false,
      done_at: new Date(),
      sont_points_en_poche: false,
      est_reco: false,
    };

    const objectifNonComplete: Objectif_v0 = {
      ...objectifComplete,
      done_at: null,
    };
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.mobilite_quotidien,
      univers_parent: Univers.transport,
      label: 'Mobilité du quotidien',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      univers_parent: Univers.alimentation,
      label: 'Gaspillage alimentaire',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 4,
      code: ThematiqueUnivers.manger_local,
      univers_parent: Univers.alimentation,
      label: 'Manger local',
    });
    const missionsUtilisateur1: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.cereales,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: 'alimentation',
        },
        {
          id: '2',
          done_at: null,
          thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
          objectifs: [objectifNonComplete, objectifNonComplete],
          est_visible: true,
          univers: 'alimentation',
        },
        {
          id: '3',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.mobilite_quotidien,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: 'alimentation',
        },
      ],
    };
    const missionsUtilisateur2: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: null,
          thematique_univers: ThematiqueUnivers.cereales,
          objectifs: [objectifComplete, objectifNonComplete],
          est_visible: true,
          univers: 'alimentation',
        },
        {
          id: '2',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: 'alimentation',
        },
        {
          id: '3',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.mobilite_quotidien,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: 'alimentation',
        },
      ],
    };
    await thematiqueRepository.onApplicationBootstrap();
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-1',
      defis: defis_1,
      missions: missionsUtilisateur1,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-2',
      email: 'user-email@toto.fr',
      defis: defis_2,
      missions: missionsUtilisateur2,
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
    const userStatistique1 = await TestUtil.prisma.statistique.findUnique({
      where: { utilisateurId: 'test-id-1' },
    });
    const userStatistique2 = await TestUtil.prisma.statistique.findUnique({
      where: { utilisateurId: 'test-id-2' },
    });

    delete userStatistique1.created_at;
    delete userStatistique1.updated_at;
    delete userStatistique2.created_at;
    delete userStatistique2.updated_at;

    expect(nombreDeLignesTableStatistique).toHaveLength(2);
    expect(userStatistique1).toEqual({
      utilisateurId: 'test-id-1',
      nombre_defis_pas_envie: 2,
      nombre_defis_abandonnes: 2,
      nombre_defis_en_cours: 1,
      nombre_defis_realises: 1,
      thematiques_en_cours: null,
      thematiques_terminees: `${ThematiqueUnivers.cereales}, ${ThematiqueUnivers.mobilite_quotidien}`,
      univers_en_cours: null,
      univers_termines: `${Univers.alimentation}, ${Univers.transport}`,
    });
    expect(userStatistique2).toEqual({
      utilisateurId: 'test-id-2',
      nombre_defis_pas_envie: 1,
      nombre_defis_abandonnes: 1,
      nombre_defis_en_cours: 0,
      nombre_defis_realises: 1,
      thematiques_en_cours: ThematiqueUnivers.cereales,
      thematiques_terminees: `${ThematiqueUnivers.gaspillage_alimentaire}, ${ThematiqueUnivers.mobilite_quotidien}`,
      univers_en_cours: Univers.alimentation,
      univers_termines: Univers.transport,
    });
  });

  it("POST /admin/article-statistique - calcul des statistiques de l'ensemble des articles", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.article, {
      content_id: 'article-id-1',
      titre: 'Titre de mon article 1',
    });
    await TestUtil.create(DB.article, {
      content_id: 'article-id-2',
      titre: 'Titre de mon article 2',
    });
    await TestUtil.create(DB.article, {
      content_id: 'article-id-3',
      titre: 'Titre de mon article 3',
    });
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
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-3',
      email: 'user-email@titi.fr',
      history: {
        version: 0,
        article_interactions: [
          {
            content_id: 'article-id-1',
            read_date: new Date(),
            like_level: 3,
            points_en_poche: false,
            favoris: false,
          },
        ],
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
    const article1 = await TestUtil.prisma.articleStatistique.findUnique({
      where: { articleId: 'article-id-1' },
    });
    const article2 = await TestUtil.prisma.articleStatistique.findUnique({
      where: { articleId: 'article-id-2' },
    });
    const article3 = await TestUtil.prisma.articleStatistique.findUnique({
      where: { articleId: 'article-id-3' },
    });

    expect(nombreDeLignesTableStatistique).toHaveLength(3);

    expect(article1.rating.toString()).toBe('3.3');
    expect(article2.rating.toString()).toBe('2');
    expect(article3.rating).toBeNull();

    expect(article1.nombre_de_rating).toBe(3);
    expect(article2.nombre_de_rating).toBe(1);
    expect(article3.rating).toBeNull();

    expect(article1.nombre_de_mise_en_favoris).toBe(2);
    expect(article2.nombre_de_mise_en_favoris).toBe(1);
    expect(article3.nombre_de_mise_en_favoris).toBe(0);

    expect(article1.titre).toBe('Titre de mon article 1');
    expect(article2.titre).toBe('Titre de mon article 2');
    expect(article3.titre).toBe('Titre de mon article 3');
  });

  it("POST /admin/defi-statistique - calcul des statistiques de l'ensemble des défis", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    const DEFI: Defi_v0 = {
      id: '1',
      points: 10,
      tags: [],
      titre: 'titre',
      thematique: Thematique.transport,
      astuces: 'ASTUCE',
      date_acceptation: null,
      pourquoi: 'POURQUOI',
      sous_titre: 'SOUS TITRE',
      status: DefiStatus.todo,
      universes: [Univers.climat],
      accessible: true,
      motif: '',
      categorie: Categorie.recommandation,
      mois: [],
      conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
      sont_points_en_poche: false,
    };

    const defi1 = {
      ...DEFI,
      id: '1',
      titre: 'A',
    };
    const defi2 = {
      ...DEFI,
      id: '2',
      titre: 'B',
    };
    const defi3 = {
      ...DEFI,
      id: '3',
      titre: 'C',
    };
    const defi4 = {
      ...DEFI,
      id: '4',
      titre: 'D',
    };

    const defis_user_1: DefiHistory_v0 = {
      version: 0,
      defis: [
        { ...defi1, status: DefiStatus.pas_envie },
        { ...defi2, status: DefiStatus.pas_envie },
        { ...defi3, status: DefiStatus.pas_envie },
        { ...defi4, status: DefiStatus.pas_envie, motif: 'pas envie user1' },
      ],
    };
    const defis_user_2: DefiHistory_v0 = {
      version: 0,
      defis: [
        { ...defi1, status: DefiStatus.en_cours },
        {
          ...defi2,
          status: DefiStatus.abondon,
          motif: 'Top dur à mettre en place',
        },
        { ...defi3, status: DefiStatus.fait },
        { ...defi4, status: DefiStatus.pas_envie },
      ],
    };

    const defis_user_3: DefiHistory_v0 = {
      version: 0,
      defis: [
        { ...defi1, status: DefiStatus.fait },
        {
          ...defi2,
          status: DefiStatus.pas_envie,
          motif: 'pas envie defi2 user3',
        },
        { ...defi3, status: DefiStatus.fait },
        {
          ...defi4,
          status: DefiStatus.pas_envie,
          motif: 'pas envie defi4 user3',
        },
      ],
    };

    const defis_user_4: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...defi1,
          status: DefiStatus.abondon,
          motif: 'motif abandon defi1 user4',
        },
        {
          ...defi2,
          status: DefiStatus.abondon,
          motif: 'motif abandon defi2 user4',
        },
        {
          ...defi3,
          status: DefiStatus.pas_envie,
          motif: 'motif pas envie defi3 user4',
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      email: '1',
      defis: defis_user_1,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      email: '2',
      defis: defis_user_2,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      email: '3',
      defis: defis_user_3,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '4',
      email: '4',
      defis: defis_user_4,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/defi-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(4);

    const defi_1_stat = await TestUtil.prisma.defiStatistique.findUnique({
      where: { content_id: '1' },
    });
    const defi_2_stat = await TestUtil.prisma.defiStatistique.findUnique({
      where: { content_id: '2' },
    });
    const defi_3_stat = await TestUtil.prisma.defiStatistique.findUnique({
      where: { content_id: '3' },
    });
    const defi_4_stat = await TestUtil.prisma.defiStatistique.findUnique({
      where: { content_id: '4' },
    });

    delete defi_1_stat.created_at;
    delete defi_1_stat.updated_at;
    delete defi_2_stat.created_at;
    delete defi_2_stat.updated_at;
    delete defi_3_stat.created_at;
    delete defi_3_stat.updated_at;
    delete defi_4_stat.created_at;
    delete defi_4_stat.updated_at;

    expect(defi_1_stat).toEqual({
      content_id: '1',
      titre: 'A',
      nombre_defis_pas_envie: 1,
      nombre_defis_abandonnes: 1,
      nombre_defis_en_cours: 1,
      nombre_defis_realises: 1,
      raisons_defi_pas_envie: [],
      raisons_defi_abandonne: ['motif abandon defi1 user4'],
    });
    expect(defi_2_stat).toEqual({
      content_id: '2',
      titre: 'B',
      nombre_defis_pas_envie: 2,
      nombre_defis_abandonnes: 2,
      nombre_defis_en_cours: 0,
      nombre_defis_realises: 0,
      raisons_defi_pas_envie: ['pas envie defi2 user3'],
      raisons_defi_abandonne: [
        'Top dur à mettre en place',
        'motif abandon defi2 user4',
      ],
    });
    expect(defi_3_stat).toEqual({
      content_id: '3',
      titre: 'C',
      nombre_defis_pas_envie: 2,
      nombre_defis_abandonnes: 0,
      nombre_defis_en_cours: 0,
      nombre_defis_realises: 2,
      raisons_defi_pas_envie: ['motif pas envie defi3 user4'],
      raisons_defi_abandonne: [],
    });
    expect(defi_4_stat).toEqual({
      content_id: '4',
      titre: 'D',
      nombre_defis_pas_envie: 3,
      nombre_defis_abandonnes: 0,
      nombre_defis_en_cours: 0,
      nombre_defis_realises: 0,
      raisons_defi_pas_envie: ['pas envie user1', 'pas envie defi4 user3'],
      raisons_defi_abandonne: [],
    });
  });

  it("POST /admin/quiz-statistique - calcul des statistiques de l'ensemble des quiz", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-1',
      email: 'john-doe@dev.com',
      history: {
        version: 0,
        quizz_interactions: [
          {
            content_id: 'id-quiz-1',
            points_en_poche: false,
            attempts: [{ score: 0, date: new Date() }],
          },
          {
            content_id: 'id-quiz-2',
            points_en_poche: true,
            attempts: [{ score: 100, date: new Date() }],
          },
        ],
      },
    });

    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-2',
      email: 'john-doedoe@dev.com',
      history: {
        version: 0,
        quizz_interactions: [
          {
            content_id: 'id-quiz-1',
            points_en_poche: true,
            attempts: [{ score: 100, date: new Date() }],
          },
          {
            content_id: 'id-quiz-2',
            points_en_poche: true,
            attempts: [{ score: 100, date: new Date() }],
          },
        ],
      },
    });

    await TestUtil.create(DB.quizz, {
      content_id: 'id-quiz-1',
      titre: 'Question quiz 1',
    });

    await TestUtil.create(DB.quizz, {
      content_id: 'id-quiz-2',
      titre: 'Question quiz 2',
    });

    // WHEN
    const response = await TestUtil.POST('/admin/quiz-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual(['id-quiz-1', 'id-quiz-2']);

    const quiz1 = await TestUtil.prisma.quizStatistique.findUnique({
      where: { quizId: 'id-quiz-1' },
    });
    const quiz2 = await TestUtil.prisma.quizStatistique.findUnique({
      where: { quizId: 'id-quiz-2' },
    });

    expect(quiz1.nombre_de_bonne_reponse).toEqual(1);
    expect(quiz1.nombre_de_mauvaise_reponse).toEqual(1);
    expect(quiz1.titre).toEqual('Question quiz 1');
    expect(quiz2.nombre_de_bonne_reponse).toEqual(2);
    expect(quiz2.nombre_de_mauvaise_reponse).toEqual(0);
    expect(quiz2.titre).toEqual('Question quiz 2');
  });

  it("POST /admin/kyc-statistique - calcul des statistiques de l'ensemble des kyc", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-1',
      email: 'john-doe@dev.com',
      kyc: {
        answered_questions: [
          {
            id: 'id-kyc-1',
            question: `Question kyc 1`,
            reponses: [
              { label: 'Le climat', code: Thematique.climat },
              { label: 'Mon logement', code: Thematique.logement },
            ],
          },
          {
            id: 'id-kyc-2',
            question: `Question kyc 2`,
            reponses: [{ label: 'Une réponse', code: Thematique.climat }],
          },
        ],
      },
    });

    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-2',
      email: 'john-doedoe@dev.com',
      kyc: {
        answered_questions: [
          {
            id: 'id-kyc-1',
            question: `Question kyc 1`,
            reponses: [
              { label: 'Le climat', code: Thematique.climat },
              { label: 'Mon logement', code: Thematique.logement },
              { label: 'Appartement', code: Thematique.logement },
            ],
          },
        ],
      },
    });

    // WHEN
    const response = await TestUtil.POST('/admin/kyc-statistique');

    // THEN
    expect(response.status).toBe(201);

    const kyc1 = await TestUtil.prisma.kycStatistique.findUnique({
      where: {
        utilisateurId_kycId: {
          utilisateurId: 'test-id-1',
          kycId: 'id-kyc-1',
        },
      },
    });
    const kyc2 = await TestUtil.prisma.kycStatistique.findUnique({
      where: {
        utilisateurId_kycId: {
          utilisateurId: 'test-id-1',
          kycId: 'id-kyc-2',
        },
      },
    });
    const kyc3 = await TestUtil.prisma.kycStatistique.findUnique({
      where: {
        utilisateurId_kycId: {
          utilisateurId: 'test-id-2',
          kycId: 'id-kyc-1',
        },
      },
    });

    expect(kyc1.titre).toEqual('Question kyc 1');
    expect(kyc1.reponse).toEqual('Le climat, Mon logement');
    expect(kyc2.titre).toEqual('Question kyc 2');
    expect(kyc2.reponse).toEqual('Une réponse');
    expect(kyc3.titre).toEqual('Question kyc 1');
    expect(kyc3.reponse).toEqual('Appartement, Le climat, Mon logement');
  });

  it("POST /admin/thematique-statistique - calcul des statistiques de l'ensemble des thématiques", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'Alimentation',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.mobilite_quotidien,
      univers_parent: Univers.transport,
      label: 'Mobilité du quotidien',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      univers_parent: Univers.alimentation,
      label: 'Gaspillage alimentaire',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 4,
      code: ThematiqueUnivers.manger_local,
      univers_parent: Univers.alimentation,
      label: 'Manger local',
    });
    const missionsUtilisateur1: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.cereales,
          univers: 'alimentation',
          objectifs: [
            {
              id: '1',
              content_id: '12',
              type: ContentType.article,
              titre: 'Super article',
              points: 10,
              is_locked: false,
              done_at: new Date(),
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '3',
              content_id: '001',
              type: ContentType.defi,
              titre: 'Action à faire',
              points: 10,
              is_locked: true,
              done_at: new Date(),
              sont_points_en_poche: false,
              est_reco: true,
            },
          ],
          est_visible: true,
        },
        {
          id: '3',
          done_at: null,
          thematique_univers: ThematiqueUnivers.mobilite_quotidien,
          univers: Univers.transport,
          objectifs: [
            {
              id: '1',
              content_id: '14',
              type: ContentType.article,
              titre: 'Super article',
              points: 10,
              is_locked: false,
              done_at: new Date(),
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '3',
              content_id: '003',
              type: ContentType.defi,
              titre: 'Action à faire',
              points: 10,
              is_locked: true,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
          ],
          est_visible: true,
        },
      ],
    };
    const missionsUtilisateur2: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: null,
          thematique_univers: ThematiqueUnivers.cereales,
          univers: Univers.alimentation,
          objectifs: [
            {
              id: '1',
              content_id: '12',
              type: ContentType.article,
              titre: 'Super article',
              points: 10,
              is_locked: false,
              done_at: new Date(0),
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '3',
              content_id: '001',
              type: ContentType.defi,
              titre: 'Action à faire',
              points: 10,
              is_locked: true,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
          ],
          est_visible: true,
        },
        {
          id: '2',
          done_at: null,
          thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
          univers: Univers.alimentation,
          objectifs: [
            {
              id: '1',
              content_id: '13',
              type: ContentType.article,
              titre: 'Super article',
              points: 10,
              is_locked: false,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '3',
              content_id: '002',
              type: ContentType.defi,
              titre: 'Action à faire',
              points: 10,
              is_locked: true,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
          ],
          est_visible: true,
        },
        {
          id: '3',
          done_at: null,
          thematique_univers: ThematiqueUnivers.mobilite_quotidien,
          univers: Univers.transport,
          objectifs: [
            {
              id: '1',
              content_id: '14',
              type: ContentType.article,
              titre: 'Super article',
              points: 10,
              is_locked: false,
              done_at: new Date(),
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '3',
              content_id: '003',
              type: ContentType.defi,
              titre: 'Action à faire',
              points: 10,
              is_locked: true,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
          ],
          est_visible: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur1',
      missions: missionsUtilisateur1,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur2',
      email: 'user2@test.com',
      missions: missionsUtilisateur2,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/thematique-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual(['1', '2', '3']);

    const thematique1 = await TestUtil.prisma.thematiqueStatistique.findUnique({
      where: { thematiqueId: '1' },
    });
    const thematique2 = await TestUtil.prisma.thematiqueStatistique.findUnique({
      where: { thematiqueId: '2' },
    });
    const thematique3 = await TestUtil.prisma.thematiqueStatistique.findUnique({
      where: { thematiqueId: '3' },
    });

    delete thematique1.updated_at;
    delete thematique1.created_at;
    delete thematique2.updated_at;
    delete thematique2.created_at;
    delete thematique3.updated_at;
    delete thematique3.created_at;

    expect(thematique1).toStrictEqual({
      thematiqueId: '1',
      titre: ThematiqueUnivers.cereales,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 1,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 1,
    });
    expect(thematique2).toStrictEqual({
      thematiqueId: '2',
      titre: ThematiqueUnivers.gaspillage_alimentaire,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 0,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 0,
    });
    expect(thematique3).toStrictEqual({
      thematiqueId: '3',
      titre: ThematiqueUnivers.mobilite_quotidien,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 2,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 0,
    });
  });

  it("POST /admin/univers-statistique - calcul des statistiques de l'ensemble des univers", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.mobilite_quotidien,
      univers_parent: Univers.transport,
      label: 'Mobilité du quotidien',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      univers_parent: Univers.alimentation,
      label: 'Gaspillage alimentaire',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 4,
      code: ThematiqueUnivers.partir_vacances,
      univers_parent: Univers.climat,
      label: 'Manger local',
    });

    await thematiqueRepository.onApplicationBootstrap();

    const objectifComplete: Objectif_v0 = {
      id: '1',
      content_id: '12',
      type: ContentType.article,
      titre: 'Super article',
      points: 10,
      is_locked: false,
      done_at: new Date(),
      sont_points_en_poche: false,
      est_reco: false,
    };

    const objectifNonComplete: Objectif_v0 = {
      ...objectifComplete,
      done_at: null,
    };

    const missionsUtilisateur1: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.cereales,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: Univers.alimentation,
        },
        {
          id: '2',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: Univers.alimentation,
        },
        {
          id: '3',
          done_at: null,
          thematique_univers: ThematiqueUnivers.mobilite_quotidien,
          objectifs: [objectifComplete, objectifNonComplete],
          est_visible: true,
          univers: Univers.transport,
        },
        {
          id: '4',
          done_at: null,
          thematique_univers: ThematiqueUnivers.partir_vacances,
          objectifs: [objectifComplete, objectifNonComplete],
          est_visible: true,
          univers: Univers.transport,
        },
      ],
    };
    const missionsUtilisateur2: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.cereales,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: Univers.alimentation,
        },
        {
          id: '2',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: Univers.alimentation,
        },
        {
          id: '3',
          done_at: null,
          thematique_univers: ThematiqueUnivers.mobilite_quotidien,
          objectifs: [objectifNonComplete, objectifNonComplete],
          est_visible: true,
          univers: Univers.transport,
        },
        {
          id: '4',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.partir_vacances,
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          univers: Univers.transport,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur1',
      missions: missionsUtilisateur1,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur2',
      email: 'user2@test.com',
      missions: missionsUtilisateur2,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/univers-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual([
      Univers.alimentation,
      Univers.transport,
      Univers.climat,
    ]);

    const univers1 = await TestUtil.prisma.universStatistique.findUnique({
      where: { universId: Univers.alimentation },
    });
    const univers2 = await TestUtil.prisma.universStatistique.findUnique({
      where: { universId: Univers.transport },
    });
    const univers3 = await TestUtil.prisma.universStatistique.findUnique({
      where: { universId: Univers.climat },
    });

    delete univers1.created_at;
    delete univers1.updated_at;
    delete univers2.created_at;
    delete univers2.updated_at;
    delete univers3.created_at;
    delete univers3.updated_at;

    expect(univers1).toStrictEqual({
      universId: 'alimentation',
      titre: Univers.alimentation,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 0,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 2,
    });

    expect(univers2).toStrictEqual({
      universId: 'transport',
      titre: Univers.transport,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 1,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 0,
    });

    expect(univers3).toStrictEqual({
      universId: 'climat',
      titre: Univers.climat,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 1,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 1,
    });
  });

  it('GET /version', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer().get('/version');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ major: 1, minor: 0, patch: 0 });
  });
});
