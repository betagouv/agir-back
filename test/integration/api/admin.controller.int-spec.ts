import { TypeAction } from '../../../src/domain/actions/typeAction';
import { App } from '../../../src/domain/app';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { DefiStatus } from '../../../src/domain/defis/defi';
import { CelebrationType } from '../../../src/domain/gamification/celebrations/celebration';
import { Feature } from '../../../src/domain/gamification/feature';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { CodeMission } from '../../../src/domain/mission/codeMission';
import {
  DefiHistory_v0,
  Defi_v0,
} from '../../../src/domain/object_store/defi/defiHistory_v0';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Objectif_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { MissionsUtilisateur_v1 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v1';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';
import { TagExcluant } from '../../../src/domain/scoring/tagExcluant';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { ServiceStatus } from '../../../src/domain/service/service';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { LinkyRepository } from '../../../src/infrastructure/repository/linky.repository';
import { MissionRepository } from '../../../src/infrastructure/repository/mission.repository';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

const KYC_DATA: QuestionKYC_v2 = {
  code: '1',
  id_cms: 11,
  last_update: undefined,
  question: `question`,
  type: TypeReponseQuestionKYC.choix_unique,
  is_NGC: false,
  a_supprimer: false,
  categorie: Categorie.test,
  points: 10,
  reponse_complexe: [],
  reponse_simple: undefined,
  tags: [TagUtilisateur.appetence_bouger_sante],
  thematique: Thematique.consommation,
  ngc_key: '123',
  short_question: 'short',
  image_url: 'AAA',
  conditions: [],
  unite: { abreviation: 'kg' },
  emoji: '🔥',
};
describe('Admin (API test)', () => {
  const USER_CURRENT_VERSION = App.USER_CURRENT_VERSION;
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const linkyRepository = new LinkyRepository(TestUtil.prisma);
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const missionRepository = new MissionRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const quizzRepository = new QuizzRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;

    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');

    process.env.EMAIL_ENABLED = 'false';
    process.env.SERVICE_APIS_ENABLED = 'false';
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;
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
    expect(services).toHaveLength(1);

    const service = await TestUtil.prisma.serviceDefinition.findUnique({
      where: { id: 'linky' },
    });
    expect(service.image_url).toEqual(
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335771/services/multiprise-electricite-incendie-dangers.png',
    );
    expect(service.titre).toEqual(
      `Votre consommation électrique au jour le jour`,
    );
    expect(service.url).toEqual(
      'https://www.enedis.fr/le-compteur-linky-un-outil-pour-la-transition-ecologique',
    );
    expect(service.icon_url).toEqual(
      'https://res.cloudinary.com/dq023imd8/image/upload/v1708335751/services/compteur-linky.jpg',
    );
    expect(service.is_url_externe).toEqual(true);
    expect(service.is_local).toEqual(false);
    expect(service.thematiques).toEqual(['logement']);
    expect(service.minute_period).toEqual(null);
    expect(service.description).toEqual(
      'Conseils et suivi de consommation, en un seul endroit',
    );
    expect(service.sous_description).toEqual(
      'Suivez votre consommation électrique au quotidien en un clic : analysez vos habitudes, identifiez et éliminez les gaspillages pour une efficacité énergétique optimale !',
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
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      migration_enabled: true,
    });
    App.USER_CURRENT_VERSION = 2;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(userDB.version).toBe(2);
    expect(response.status).toBe(201);
    expect(response.body).toEqual([]);
  });
  it(`POST /admin/migrate_users verifie si migration active pour l'utilisateur`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      migration_enabled: false,
    });
    App.USER_CURRENT_VERSION = 3;
    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(userDB.version).toBe(2);
    expect(response.status).toBe(201);
    expect(response.body).toEqual([]);
  });
  it('POST /admin/migrate_users migration manquante', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      version: 100,
      migration_enabled: true,
    });
    App.USER_CURRENT_VERSION = 101;
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
    App.USER_CURRENT_VERSION = 1;

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
  it.skip('POST /admin/migrate_users migration V4 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const gamification: Gamification_v0 = {
      version: 0,
      points: 620,
      popup_reset_vue: false,
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
      badges: [],
    };
    await TestUtil.create(DB.utilisateur, {
      version: 3,
      migration_enabled: true,
      gamification: gamification as any,
    });
    App.USER_CURRENT_VERSION = 4;

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

  it.skip('POST /admin/migrate_users migration V7 OK', async () => {
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
          accessible: true,
          motif: 'truc',
          id: '001',
          status: DefiStatus.fait,
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          sont_points_en_poche: true,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      version: 6,
      migration_enabled: true,
      logement: {},
      defis: defis as any,
    });
    App.USER_CURRENT_VERSION = 7;

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
    expect(userDB.defi_history.getRAWDefiListe()[0].getStatus()).toEqual(
      DefiStatus.fait,
    );
  });
  it.skip('POST /admin/migrate_users migration V8 OK', async () => {
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
          universes: [Thematique.climat],
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
    App.USER_CURRENT_VERSION = 8;
    await kycRepository.loadCache();

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
    expect(userDB.kyc_history.getRawAnsweredKYCs()[0].id_cms).toEqual(1);
  });
  it.skip('POST /admin/migrate_users migration V10 OK', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.utilisateur, {
      version: 9,
      migration_enabled: true,
    });
    App.USER_CURRENT_VERSION = 10;

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

  it('POST /admin/migrate_users migration V12 OK - calcul code commune pour user', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    await TestUtil.create(DB.utilisateur, {
      version: 11,
      migration_enabled: true,
      code_commune: null,
      logement: logement as any,
    });
    App.USER_CURRENT_VERSION = 12;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 12,
            ok: true,
            info: 'Set commune 91477',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.code_commune).toEqual('91477');
    expect(userDB.version).toEqual(12);
  });
  it('POST /admin/migrate_users migration V12 OK - ras si pas de code postal sur user', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: null,
      chauffage: Chauffage.bois,
      commune: null,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    await TestUtil.create(DB.utilisateur, {
      version: 11,
      migration_enabled: true,
      code_commune: null,
      logement: logement as any,
    });
    App.USER_CURRENT_VERSION = 12;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 12,
            ok: true,
            info: 'Set commune null',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.code_commune).toEqual(null);
    expect(userDB.version).toEqual(12);
  });
  it('POST /admin/migrate_users migration V13 OK - prenom => pseudo', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.utilisateur, {
      version: 12,
      migration_enabled: true,
      prenom: 'yo',
      pseudo: null,
    });
    App.USER_CURRENT_VERSION = 13;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 13,
            ok: true,
            info: 'pseudo set ok',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.pseudo).toEqual('yo');
    expect(userDB.version).toEqual(13);
  });

  it('POST /admin/migrate_users migration V14 OK - reset personnalisation thematique', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          faite_le: new Date(),
          vue_le: null,
        },
      ],
      liste_tags_excluants: [TagExcluant.a_fait_travaux_recents],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [
            {
              action: { type: TypeAction.classique, code: '2' },
              date: new Date(),
            },
          ],
          codes_actions_proposees: [{ type: TypeAction.classique, code: '1' }],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      version: 13,
      migration_enabled: true,
      thematique_history: thematique_history as any,
    });
    App.USER_CURRENT_VERSION = 14;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 14,
            ok: true,
            info: 'personnalisation reset OK',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.thematique_history).toEqual({
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [],
    });
    expect(userDB.version).toEqual(14);
  });

  it('POST /admin/migrate_users migration V15 OK - reset utilisateur V2', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const gamification: Gamification_v0 = {
      version: 0,
      points: 2000,
      popup_reset_vue: false,
      celebrations: [],
      badges: [],
    };

    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          faite_le: new Date(),
          vue_le: null,
        },
      ],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.utilisateur, {
      version: 14,
      migration_enabled: true,
      thematique_history: thematique_history as any,
      points_classement: 100,
      commune_classement: '1234',
      code_postal_classement: '45664',
      gamification: gamification as any,
    });
    App.USER_CURRENT_VERSION = 15;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 15,
            ok: true,
            info: 'reset national OK',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.thematique_history).toEqual({
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [],
    });
    expect(userDB.version).toEqual(15);
    expect(userDB.gamification.getPoints()).toEqual(0);
    expect(userDB.points_classement).toEqual(0);
    expect(userDB.commune_classement).toEqual(null);
    expect(userDB.code_postal_classement).toEqual(null);
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
      ] as any,
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
      ] as any,
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
      accessible: true,
      motif: 'truc',
      categorie: Categorie.recommandation,
      mois: [],
      conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
      sont_points_en_poche: false,
      impact_kg_co2: 5,
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
    const missionsUtilisateur1: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.cereales,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '2',
          done_at: null,
          objectifs: [objectifNonComplete, objectifNonComplete],
          est_visible: true,
          code: CodeMission.gaspillage_alimentaire,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '3',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.mobilite_quotidien,
          image_url: 'image',
          thematique: Thematique.transport,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
      ],
    };
    const missionsUtilisateur2: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: null,
          objectifs: [objectifComplete, objectifNonComplete],
          est_visible: true,
          code: CodeMission.cereales,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '2',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.gaspillage_alimentaire,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '3',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.mobilite_quotidien,
          image_url: 'image',
          thematique: Thematique.transport,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
      ],
    };
    await thematiqueRepository.upsert({
      id_cms: 1,
      code: Thematique.alimentation,
      titre: 'Alimentation',
      emoji: '🔥',
      image_url: 'https://img',
      label: 'alimentation label',
    });
    await thematiqueRepository.upsert({
      id_cms: 1,
      code: Thematique.transport,
      titre: 'Transport',
      emoji: '🔥',
      image_url: 'https://img',
      label: 'transport label',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-1',
      defis: defis_1 as any,
      missions: missionsUtilisateur1 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-2',
      email: 'user-email@toto.fr',
      defis: defis_2 as any,
      missions: missionsUtilisateur2 as any,
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
      thematiques_terminees: `${CodeMission.cereales}, ${CodeMission.mobilite_quotidien}`,
      univers_en_cours: null,
      univers_termines: `${Thematique.alimentation}, ${Thematique.transport}`,
    });
    expect(userStatistique2).toEqual({
      utilisateurId: 'test-id-2',
      nombre_defis_pas_envie: 1,
      nombre_defis_abandonnes: 1,
      nombre_defis_en_cours: 0,
      nombre_defis_realises: 1,
      thematiques_en_cours: CodeMission.cereales,
      thematiques_terminees: `${CodeMission.gaspillage_alimentaire}, ${CodeMission.mobilite_quotidien}`,
      univers_en_cours: Thematique.alimentation,
      univers_termines: Thematique.transport,
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
    await articleRepository.loadCache();

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
      } as any,
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
        ] as any,
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
      } as any,
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

  it("POST /admin/article-statistique - cas où l'article n'est plus présent dans la base des articles", async () => {
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
      } as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/article-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body).toEqual(['article-id-1']);

    const article1 = await TestUtil.prisma.articleStatistique.findUnique({
      where: { articleId: 'article-id-1' },
    });

    expect(article1.rating.toString()).toBe('3');
    expect(article1.nombre_de_rating).toBe(1);
    expect(article1.nombre_de_mise_en_favoris).toBe(1);
    expect(article1.titre).toBe(`Article [article-id-1] supprimé`);
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
      accessible: true,
      motif: '',
      categorie: Categorie.recommandation,
      mois: [],
      conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
      sont_points_en_poche: false,
      impact_kg_co2: 5,
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
      defis: defis_user_1 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      email: '2',
      defis: defis_user_2 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      email: '3',
      defis: defis_user_3 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '4',
      email: '4',
      defis: defis_user_4 as any,
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

    expect(
      defi_2_stat.raisons_defi_abandonne.includes('Top dur à mettre en place'),
    ).toEqual(true);
    expect(
      defi_2_stat.raisons_defi_abandonne.includes('motif abandon defi2 user4'),
    ).toEqual(true);
    delete defi_2_stat.raisons_defi_abandonne;
    expect(defi_2_stat).toEqual({
      content_id: '2',
      titre: 'B',
      nombre_defis_pas_envie: 2,
      nombre_defis_abandonnes: 2,
      nombre_defis_en_cours: 0,
      nombre_defis_realises: 0,
      raisons_defi_pas_envie: ['pas envie defi2 user3'],
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

    expect(
      defi_4_stat.raisons_defi_pas_envie.includes('pas envie user1'),
    ).toEqual(true);
    expect(
      defi_4_stat.raisons_defi_pas_envie.includes('pas envie defi4 user3'),
    ).toEqual(true);
    delete defi_4_stat.raisons_defi_pas_envie;
    expect(defi_4_stat).toEqual({
      content_id: '4',
      titre: 'D',
      nombre_defis_pas_envie: 3,
      nombre_defis_abandonnes: 0,
      nombre_defis_en_cours: 0,
      nombre_defis_realises: 0,
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
      } as any,
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
      } as any,
    });

    await TestUtil.create(DB.quizz, {
      content_id: 'id-quiz-1',
      titre: 'Question quiz 1',
    });

    await TestUtil.create(DB.quizz, {
      content_id: 'id-quiz-2',
      titre: 'Question quiz 2',
    });

    await quizzRepository.loadCache();

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

  it("POST /admin/quiz-statistique - pas d'erreur si un quizz n'hesiste plus dans la base des quizz", async () => {
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
        ],
      } as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/quiz-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body).toEqual(['id-quiz-1']);

    const quiz1 = await TestUtil.prisma.quizStatistique.findUnique({
      where: { quizId: 'id-quiz-1' },
    });

    expect(quiz1.nombre_de_bonne_reponse).toEqual(0);
    expect(quiz1.nombre_de_mauvaise_reponse).toEqual(1);
    expect(quiz1.titre).toEqual(`Quizz [id-quiz-1] supprimé`);
  });

  it("POST /admin/kyc-statistique - calcul des statistiques de l'ensemble des kyc", async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: 'id-kyc-1',
          type: TypeReponseQuestionKYC.choix_multiple,
          question: `Question kyc 1`,
          reponse_complexe: [
            { label: 'Le climat', code: Thematique.climat, selected: true },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: true,
            },
          ],
        },
        {
          ...KYC_DATA,
          id_cms: 2,
          code: 'id-kyc-2',
          question: `Question kyc 2`,
          type: TypeReponseQuestionKYC.choix_multiple,
          reponse_complexe: [
            { label: 'Une réponse', code: Thematique.climat, selected: true },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-1',
      email: 'john-doe@dev.com',
      kyc: kyc as any,
    });

    const kyc_2: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: 'id-kyc-1',
          question: `Question kyc 1`,
          type: TypeReponseQuestionKYC.choix_multiple,
          reponse_complexe: [
            { label: 'Le climat', code: Thematique.climat, selected: true },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: true,
            },
            { label: 'Appartement', code: Thematique.logement, selected: true },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      id: 'test-id-2',
      email: 'john-doedoe@dev.com',
      kyc: kyc_2 as any,
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

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.alimentation,
      label: 'Alimentation',
    });

    const missionsUtilisateur1: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          code: CodeMission.cereales,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
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
          code: CodeMission.mobilite_quotidien,
          image_url: 'image',
          thematique: Thematique.transport,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
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
          est_examen: false,
        },
      ],
    };
    const missionsUtilisateur2: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: null,
          code: CodeMission.cereales,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
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
          est_examen: false,
        },
        {
          id: '2',
          done_at: null,
          code: CodeMission.gaspillage_alimentaire,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
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
          est_examen: false,
        },
        {
          id: '3',
          done_at: null,
          code: CodeMission.mobilite_quotidien,
          image_url: 'image',
          thematique: Thematique.transport,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
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
          est_examen: false,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur1',
      missions: missionsUtilisateur1 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur2',
      email: 'user2@test.com',
      missions: missionsUtilisateur2 as any,
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
      titre: CodeMission.cereales,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 1,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 1,
    });
    expect(thematique2).toStrictEqual({
      thematiqueId: '2',
      titre: CodeMission.gaspillage_alimentaire,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 0,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 0,
    });
    expect(thematique3).toStrictEqual({
      thematiqueId: '3',
      titre: CodeMission.mobilite_quotidien,
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

    const missionsUtilisateur1: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.cereales,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '2',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.gaspillage_alimentaire,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '3',
          done_at: null,
          objectifs: [objectifComplete, objectifNonComplete],
          est_visible: true,
          code: CodeMission.mobilite_quotidien,
          image_url: 'image',
          thematique: Thematique.transport,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '4',
          done_at: null,
          objectifs: [objectifComplete, objectifNonComplete],
          est_visible: true,
          code: CodeMission.partir_vacances,
          image_url: 'image',
          thematique: Thematique.transport,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
      ],
    };
    const missionsUtilisateur2: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.cereales,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '2',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.gaspillage_alimentaire,
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '3',
          done_at: null,
          objectifs: [objectifNonComplete, objectifNonComplete],
          est_visible: true,
          code: CodeMission.mobilite_quotidien,
          image_url: 'image',
          thematique: Thematique.transport,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
        {
          id: '4',
          done_at: new Date(),
          objectifs: [objectifComplete, objectifComplete],
          est_visible: true,
          code: CodeMission.partir_vacances,
          image_url: 'image',
          thematique: Thematique.climat,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur1',
      missions: missionsUtilisateur1 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur2',
      email: 'user2@test.com',
      missions: missionsUtilisateur2 as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/univers-statistique');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual([
      Thematique.alimentation,
      Thematique.transport,
      Thematique.climat,
    ]);

    const univers1 = await TestUtil.prisma.universStatistique.findUnique({
      where: { universId: Thematique.alimentation },
    });
    const univers2 = await TestUtil.prisma.universStatistique.findUnique({
      where: { universId: Thematique.transport },
    });
    const univers3 = await TestUtil.prisma.universStatistique.findUnique({
      where: { universId: Thematique.climat },
    });

    delete univers1.created_at;
    delete univers1.updated_at;
    delete univers2.created_at;
    delete univers2.updated_at;
    delete univers3.created_at;
    delete univers3.updated_at;

    expect(univers1).toStrictEqual({
      universId: 'alimentation',
      titre: Thematique.alimentation,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 0,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 2,
    });

    /* FIXME
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
    */
  });

  it('GET /admin/prenoms_a_valider', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'A',
      est_valide_pour_classement: false,
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'B',
      est_valide_pour_classement: false,
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      pseudo: 'C',
      est_valide_pour_classement: true,
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: '',
      est_valide_pour_classement: false,
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '5',
      pseudo: null,
      est_valide_pour_classement: false,
      email: '5',
    });
    // WHEN
    const response = await TestUtil.GET('/admin/prenoms_a_valider');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toContainEqual({ id: '1', pseudo: 'A' });
    expect(response.body).toContainEqual({ id: '2', pseudo: 'B' });
  });
  it('POST /admin/valider_prenoms', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'A',
      est_valide_pour_classement: false,
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'B',
      est_valide_pour_classement: false,
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      pseudo: 'C',
      est_valide_pour_classement: false,
      email: '3',
    });
    // WHEN
    const response = await TestUtil.POST('/admin/valider_prenoms').send([
      { id: '1', pseudo: 'George' },
      { id: '2', pseudo: 'Paul' },
    ]);

    // THEN
    expect(response.status).toBe(201);
    const listeUsers = await TestUtil.prisma.utilisateur.findMany({
      select: {
        id: true,
        pseudo: true,
        est_valide_pour_classement: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    expect(listeUsers).toEqual([
      {
        est_valide_pour_classement: true,
        id: '1',
        pseudo: 'George',
      },
      {
        est_valide_pour_classement: true,
        id: '2',
        pseudo: 'Paul',
      },
      {
        est_valide_pour_classement: false,
        id: '3',
        pseudo: 'C',
      },
    ]);
  });
  it('POST /admin/create_brevo_contacts', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'A',
      email: 'email1',
      brevo_created_at: new Date(),
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'B',
      email: 'email2',
      brevo_created_at: null,
    });
    // WHEN
    const response = await TestUtil.POST('/admin/create_brevo_contacts');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('[email2] CREATE OK');

    const userDB = await utilisateurRepository.getById('2', []);
    expect(userDB.brevo_created_at.getTime()).toBeGreaterThan(Date.now() - 200);
  });
  it(`POST /admin/create_brevo_contacts 2 fois n'ajoute plus`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'B',
      email: 'email2',
      brevo_created_at: null,
    });
    // WHEN
    let response = await TestUtil.POST('/admin/create_brevo_contacts');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('[email2] CREATE OK');

    // WHEN
    response = await TestUtil.POST('/admin/create_brevo_contacts');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(0);
  });
  it(`GET/POST /admin/id/raw_sql_user lit / écrit un utilisateur en BDD`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);
    // GIVEN
    let response = await TestUtil.GET('/admin/utilisateur-id/raw_sql_user');

    //WHEN
    let response2 = await TestUtil.POST(
      '/admin/utilisateur-id/raw_sql_user',
    ).send(response.body);

    // THEN
    expect(response2.status).toBe(201);
    expect(response2.body.email).toEqual(response2.body.id + '@agir.dev');
    expect(response2.body.id.length).toBeGreaterThan(20);

    const dbUser = await utilisateurRepository.getById(response2.body.id, [
      Scope.ALL,
    ]);
    expect(dbUser.prenom).toEqual('prenom');
  });
  it(`GET /admin/liste_user_with_mission_done liste les user avec une mission terminée de code donné`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    // GIVEN
    const mission_unique_done: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          code: CodeMission.cereales,
          image_url: 'img',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          objectifs: [
            {
              id: '0',
              content_id: '1',
              type: ContentType.article,
              titre: '1 article',
              points: 10,
              is_locked: false,
              done_at: new Date(),
              sont_points_en_poche: false,
              est_reco: true,
            },
          ],
          est_visible: true,
          est_examen: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique_done as any,
    });

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      code: CodeMission.cereales,
    });
    await missionRepository.onApplicationBootstrap();
    await thematiqueRepository.onApplicationBootstrap();

    //WHEN
    let response = await TestUtil.GET(
      '/admin/liste_user_with_mission_done?code_mission=cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        email: 'yo@truc.com',
        id: 'utilisateur-id',
      },
    ]);
  });

  it('GET extract les utilisateurs avec voiture', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          code: KYCID.KYC_transport_voiture_km,
          question: `km voituyre`,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: true,
          categorie: Categorie.test,
          points: 10,
          tags: [],
          reponse_simple: {
            unite: { abreviation: 'kg' },
            value: '123',
          },
          conditions: [],
          id_cms: 1,
          last_update: new Date(),
          reponse_complexe: undefined,
          thematique: Thematique.alimentation,
        },
      ],
    };
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_transport_voiture_km,
      type: TypeReponseQuestionKYC.entier,
    });

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/admin/utilisateur_avec_voiture');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        elec: false,
        email: 'yo@truc.com',
        id: 'utilisateur-id',
        km: 123,
        proprio: false,
        thermique: false,
        trajet_court_voit: false,
        trajet_ma_voiture: false,
        changer_voiture: false,
        motorisation: null,
      },
    ]);
  });

  it('POST /admin/aide_expired_soon  flag les aides qui vont bientôt expirer', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    const day = 1000 * 60 * 60 * 24;
    const week = day * 7;
    const month = day * 30;

    await TestUtil.create(DB.aide, {
      content_id: '1',
      date_expiration: new Date(Date.now() + 2 * month),
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      date_expiration: new Date(Date.now() + month - 10000),
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      date_expiration: new Date(Date.now() + week - 10000),
    });
    await TestUtil.create(DB.aide, {
      content_id: '4',
      date_expiration: new Date(Date.now() - 10000),
    });

    // WHEN
    const response = await TestUtil.POST('/admin/aide_expired_soon');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      'REMOVED : 1',
      'SET : 2:Month[true]Week[false]Expired[false]',
      'SET : 3:Month[true]Week[true]Expired[false]',
      'SET : 4:Month[true]Week[true]Expired[true]',
    ]);
    const aides_warning =
      await TestUtil.prisma.aideExpirationWarning.findMany();

    expect(aides_warning).toHaveLength(3);
    expect(aides_warning[0].aide_cms_id).toEqual('2');
    expect(aides_warning[0].last_month).toEqual(true);
    expect(aides_warning[0].last_week).toEqual(false);
    expect(aides_warning[0].expired).toEqual(false);
    expect(aides_warning[1].aide_cms_id).toEqual('3');
    expect(aides_warning[1].last_month).toEqual(true);
    expect(aides_warning[1].last_week).toEqual(true);
    expect(aides_warning[1].expired).toEqual(false);
    expect(aides_warning[2].aide_cms_id).toEqual('4');
    expect(aides_warning[2].last_month).toEqual(true);
    expect(aides_warning[2].last_week).toEqual(true);
    expect(aides_warning[2].expired).toEqual(true);
  });

  it(`POST /admin/aide_expired_soon_emails envoie les emails pour les aides en voie d'expiration`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.EMAILS_WARNING_AIDE_EXPIRATION = 'agir@dev.com';

    await TestUtil.create(DB.aideExpirationWarning, {
      aide_cms_id: '1',
      last_month: true,
    });
    await TestUtil.create(DB.aideExpirationWarning, {
      aide_cms_id: '2',
      last_week: true,
    });
    await TestUtil.create(DB.aideExpirationWarning, {
      aide_cms_id: '3',
      expired: true,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/aide_expired_soon_emails');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual(['month:1', 'week:2', 'expired:3']);

    const aides_warning =
      await TestUtil.prisma.aideExpirationWarning.findMany();

    expect(aides_warning[0].last_month_sent).toEqual(true);
    expect(aides_warning[1].last_week_sent).toEqual(true);
    expect(aides_warning[2].expired_sent).toEqual(true);
  });

  it('GET /aides toutes les aides avec les bonnes meta données en mode export', async () => {
    // GIVEN
    process.env.CRON_API_KEY = TestUtil.token;

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['21000'], // metropole
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['01170'], // CA
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      codes_postaux: ['01160'], // CC
    });
    await TestUtil.create(DB.aide, {
      content_id: '4',
      codes_postaux: ['14280'], // CU
    });

    // WHEN
    const response = await TestUtil.GET('/aides_export');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0]).toEqual({
      content_id: '1',
      titre: 'titreA',
      contenu: "Contenu de l'aide",
      codes_postaux: '21000',
      thematiques: ['climat', 'logement'],
      montant_max: 999,
      codes_departement: '',
      codes_region: '',
      com_agglo: '',
      com_urbaine: '',
      com_com: '',
      metropoles: 'Dijon Métropole',
      echelle: 'National',
      url_source: 'https://hello',
      url_demande: 'https://demande',
    });
    expect(response.body[0].metropoles).toEqual('Dijon Métropole');
    expect(response.body[1].com_agglo).toEqual('CA du Pays de Gex');
    expect(response.body[2].com_agglo).toEqual(
      'CA du Bassin de Bourg-en-Bresse',
    );
    expect(response.body[2].com_com).toEqual(
      `CC Rives de l'Ain - Pays du Cerdon`,
    );
    expect(response.body[3].com_urbaine).toEqual('CU Caen la Mer');
  });

  it('POST /admin/refresh_action_stats no actions', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'A',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'B',
      email: '2',
    });

    // WHEN
    const response = await TestUtil.POST('/admin/refresh_action_stats');

    // THEN
    expect(response.status).toBe(201);

    const actionStats = await TestUtil.prisma.compteurActions.findMany();

    expect(actionStats).toHaveLength(0);
  });
  it(`POST /admin/refresh_action_stats pas d'erreurs si action manquante`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const thematique_history1: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
          vue_le: new Date(),
          faite_le: null,
        },
        {
          action: { type: TypeAction.classique, code: '2' },
          vue_le: null,
          faite_le: new Date(),
        },
      ],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'A',
      email: '1',
      thematique_history: thematique_history1 as any,
    });

    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.POST('/admin/refresh_action_stats');

    // THEN
    expect(response.status).toBe(201);

    const actionStats = await TestUtil.prisma.compteurActions.findMany();

    expect(actionStats).toHaveLength(2);

    const action1 = await TestUtil.prisma.compteurActions.findUnique({
      where: { type_code_id: 'classique_1' },
    });
    const action2 = await TestUtil.prisma.compteurActions.findUnique({
      where: { type_code_id: 'classique_2' },
    });

    expect(action1.faites).toEqual(0);
    expect(action1.vues).toEqual(1);
    expect(action2.faites).toEqual(1);
    expect(action2.vues).toEqual(0);
  });
  it('POST /admin/refresh_action_stats 2 actions', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const thematique_history1: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
          vue_le: new Date(),
          faite_le: new Date(),
        },
      ],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };

    const thematique_history2: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
          vue_le: new Date(),
          faite_le: null,
        },
        {
          action: { type: TypeAction.classique, code: '2' },
          vue_le: new Date(),
          faite_le: null,
        },
      ],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'A',
      email: '1',
      thematique_history: thematique_history1 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'B',
      email: '2',
      thematique_history: thematique_history2 as any,
    });

    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
    });
    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.POST('/admin/refresh_action_stats');

    // THEN
    expect(response.status).toBe(201);

    const actionStats = await TestUtil.prisma.compteurActions.findMany();
    expect(actionStats).toHaveLength(2);

    const action1 = await TestUtil.prisma.compteurActions.findUnique({
      where: { type_code_id: 'classique_1' },
    });
    const action2 = await TestUtil.prisma.compteurActions.findUnique({
      where: { type_code_id: 'classique_2' },
    });

    expect(action1.faites).toEqual(1);
    expect(action1.vues).toEqual(2);
    expect(action2.faites).toEqual(0);
    expect(action2.vues).toEqual(1);
  });
});
