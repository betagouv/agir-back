import { KYC } from '@prisma/client';
import { ArticleRepository } from 'src/infrastructure/repository/article.repository';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Besoin } from '../../../src/domain/aides/besoin';
import { Echelle } from '../../../src/domain/aides/echelle';
import { App } from '../../../src/domain/app';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { KYCMosaicID } from '../../../src/domain/kyc/mosaicDefinition';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { CacheBilanCarbone_v0 } from '../../../src/domain/object_store/bilan/cacheBilanCarbone_v0';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { ApplicativePonderationSetName } from '../../../src/domain/scoring/ponderationApplicative';
import { Tag_v2 } from '../../../src/domain/scoring/system_v2/Tag_v2';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Thematique } from '../../../src/domain/thematique/thematique';
import {
  Scope,
  SourceInscription,
} from '../../../src/domain/utilisateur/utilisateur';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

const KYC_DATA: QuestionKYC_v2 = {
  code: '1',
  id_cms: 11,
  last_update: undefined,
  question: `question`,
  sous_titre: 'sous',
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
  const kycRepository = new KycRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;

    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');

    process.env.EMAIL_ENABLED = 'false';
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;
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
  it('GET /version OK', async () => {
    // WHEN
    const response = await TestUtil.getServer().get('/version');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      version: App.getBackCurrentVersion(),
    });
  });
  it('GET /check_version/123 OK', async () => {
    // WHEN
    const response = await TestUtil.getServer().get(
      '/check_version/' + App.getBackCurrentVersion(),
    );

    // THEN
    expect(response.body).toEqual({ compatible: true });
  });
  it('GET /check_version/123 KO', async () => {
    // WHEN
    const response = await TestUtil.getServer().get('/check_version/bad');

    // THEN
    expect(response.body).toEqual({ compatible: false });
  });
  it('POST /admin/lock_user_migration retourne une 200 si API CRON', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/admin/lock_user_migration');

    // THEN
    expect(response.status).toBe(201);
  });

  describe('POST /admin/migrate_users', () => {
    it('retourne une 200 si pas de user en base', async () => {
      // GIVEN
      TestUtil.token = process.env.CRON_API_KEY;

      // WHEN
      const response = await TestUtil.POST('/admin/migrate_users');

      // THEN
      expect(response.status).toBe(201);
      expect(response.body).toEqual([]);
    });

    it('migre pas un user qui a pas besoin', async () => {
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

    it(`verifie si migration active pour l'utilisateur`, async () => {
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

    it('migration manquante', async () => {
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

    it('premiere migration bidon OK', async () => {
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

    it.skip('migration V8 OK', async () => {
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
      expect(userDB.kyc_history.getAnsweredKYCs()[0].id_cms).toEqual(1);
    });
    /*
  it.skip('migration V10 OK', async () => {
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
  */

    /*
  it('migration V12 OK - calcul code commune pour user', async () => {
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
      risques: undefined,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: undefined,
      score_risques_adresse: undefined,
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
    expect(userDB.logement.code_commune).toEqual('91477');
    expect(userDB.getCachedCodeCommune()).toEqual('91477');
    expect(userDB.version).toEqual(12);
  });
  */
    /*
  it('migration V12 OK - ras si pas de code postal sur user', async () => {
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
      risques: undefined,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: undefined,
      score_risques_adresse: undefined,
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
    expect(userDB.logement.code_commune).toEqual(null);
    expect(userDB.getCachedCodeCommune()).toEqual(null);
    expect(userDB.version).toEqual(12);
  });
  */
    it('migration V13 OK - prenom => pseudo', async () => {
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

    /*
  it('migration V14 OK - reset personnalisation thematique', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          faite_le: new Date(),
          vue_le: null,
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
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
    expect(userDB.version).toEqual(App.currentUserSystemVersion());
  });
  */

    /*
  it('migration V15 OK - reset utilisateur V2', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const gamification: Gamification_v0 = {
      version: 0,
      points: 2000,
      popup_reset_vue: false,
      badges: [],
    };

    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          faite_le: new Date(),
          vue_le: null,
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
      ],

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
      liste_thematiques: [],
    });
    expect(userDB.version).toEqual(15);
    expect(userDB.force_connexion).toEqual(true);
    expect(userDB.gamification.getPoints()).toEqual(0);
    expect(userDB.gamification.getBadges()).toEqual(['pionnier']);
    expect(userDB.points_classement).toEqual(0);
    expect(userDB.commune_classement).toEqual('1234');
    expect(userDB.code_postal_classement).toEqual('45664');
  });
  */

    /*
  it('migration V16 OK - inject code_commune dans logement', async () => {
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
      risques: undefined,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: undefined,
      score_risques_adresse: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      version: 15,
      migration_enabled: true,
      code_commune: '12345',
      logement: logement as any,
    });
    App.USER_CURRENT_VERSION = 16;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 16,
            ok: true,
            info: 'updated logement.code_commune',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.getCachedCodeCommune()).toEqual('12345');
    expect(userDB.logement.code_commune).toEqual('12345');
    expect(userDB.version).toEqual(16);
    expect(userDB.logement.code_commune).toEqual('12345');
  });
  */

    /*
  it('migration V17 OK - migration de tags de reco', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [TagExcluant.a_un_jardin],
      liste_thematiques: [],
    };
    await TestUtil.create(DB.utilisateur, {
      version: 16,
      migration_enabled: true,
      thematique_history: thematique_history as any,
    });
    App.USER_CURRENT_VERSION = 17;

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        user_id: 'utilisateur-id',
        migrations: [
          {
            version: 17,
            ok: true,
            info: 'reco tags imported OK',
          },
        ],
      },
    ]);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.recommandation.getListeTagsActifs()).toEqual([
      Tag_v2.a_un_jardin,
    ]);
    expect(userDB.version).toEqual(17);
  });
  */

    it.skip('migration V18 OK - recalcul des tags de reco', async () => {
      // GIVEN
      TestUtil.token = process.env.CRON_API_KEY;
      const kyc: KYCHistory_v2 = {
        version: 2,
        skipped_mosaics: [],
        skipped_questions: [],

        answered_mosaics: [],
        answered_questions: [
          {
            ...KYC_DATA,
            code: KYCID.KYC_preference,
            id_cms: 1,
            question: `Quel est votre sujet principal d'intéret ????`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: Categorie.test,
            points: 10,
            reponse_complexe: [
              {
                label: 'Le logement',
                code: Thematique.logement,
                selected: true,
              },
              {
                label: 'Bouff',
                code: Thematique.alimentation,
                selected: false,
              },
              {
                label: 'transport',
                code: Thematique.transport,
                selected: true,
              },
              {
                label: 'conso',
                code: Thematique.consommation,
                selected: false,
              },
            ],
            reponse_simple: undefined,
          },
        ],
      };
      await TestUtil.create(DB.kYC, {
        id_cms: 1,
        code: KYCID.KYC_preference,
        question: `Quel est votre sujet principal d'intéret ?`,
        type: TypeReponseQuestionKYC.choix_multiple,
        reponses: [
          { label: 'La consommation', code: Thematique.consommation },
          { label: 'Mon logement', code: Thematique.logement },
          { label: 'Ce que je mange', code: Thematique.alimentation },
          { label: 'Comment je bouge', code: Thematique.transport },
        ],
      });
      await kycRepository.loadCache();

      await TestUtil.create(DB.utilisateur, {
        kyc: kyc as any,
        version: 17,
        migration_enabled: true,
      });
      App.USER_CURRENT_VERSION = 18;

      // WHEN
      const response = await TestUtil.POST('/admin/migrate_users');

      // THEN
      expect(response.status).toBe(201);
      expect(response.body).toEqual([
        {
          user_id: 'utilisateur-id',
          migrations: [
            {
              version: 18,
              ok: true,
              info: 'updated reco tags',
            },
          ],
        },
      ]);
      const userDB = await utilisateurRepository.getById('utilisateur-id', [
        Scope.ALL,
      ]);
      expect(userDB.recommandation.getListeTagsActifs()).toEqual([
        'appetence_thematique_transport',
        'appetence_thematique_logement',
      ]);
      expect(userDB.version).toEqual(18);
    });
    /*

    it.skip('migration V19 init le mode inscription', async () => {
      // GIVEN
      TestUtil.token = process.env.CRON_API_KEY;

      await TestUtil.create(DB.utilisateur, {
        id: '1',
        email: '1',
        version: 18,
        migration_enabled: true,
        is_magic_link_user: true,
        france_connect_sub: null,
      });
      await TestUtil.create(DB.utilisateur, {
        id: '2',
        email: '2',
        version: 18,
        migration_enabled: true,
        is_magic_link_user: false,
        france_connect_sub: null,
        passwordHash: '1234',
      });
      await TestUtil.create(DB.utilisateur, {
        id: '3',
        email: '3',
        version: 18,
        migration_enabled: true,
        is_magic_link_user: false,
        france_connect_sub: '1233',
        passwordHash: null,
      });
      await TestUtil.create(DB.utilisateur, {
        id: '4',
        email: '4',
        version: 18,
        migration_enabled: true,
        is_magic_link_user: false,
        france_connect_sub: '45678',
        passwordHash: '123',
      });
      App.USER_CURRENT_VERSION = 19;

      // WHEN
      const response = await TestUtil.POST('/admin/migrate_users');

      // THEN
      expect(response.status).toBe(201);
      expect(response.body).toEqual([
        {
          user_id: '1',
          migrations: [
            {
              version: 19,
              ok: true,
              info: `mode = [magic_link]`,
            },
          ],
        },
        {
          user_id: '2',
          migrations: [
            {
              version: 19,
              ok: true,
              info: `mode = [mot_de_passe]`,
            },
          ],
        },
        {
          user_id: '3',
          migrations: [
            {
              version: 19,
              ok: true,
              info: `mode = [france_connect]`,
            },
          ],
        },
        {
          user_id: '4',
          migrations: [
            {
              version: 19,
              ok: true,
              info: `mode = [mot_de_passe]`,
            },
          ],
        },
      ]);
      let userDB = await utilisateurRepository.getById('1', [Scope.ALL]);
      expect(userDB.mode_inscription).toEqual(ModeInscription.magic_link);
      expect(userDB.version).toEqual(19);

      userDB = await utilisateurRepository.getById('2', [Scope.ALL]);
      expect(userDB.mode_inscription).toEqual(ModeInscription.mot_de_passe);
      expect(userDB.version).toEqual(19);

      userDB = await utilisateurRepository.getById('3', [Scope.ALL]);
      expect(userDB.mode_inscription).toEqual(ModeInscription.france_connect);
      expect(userDB.version).toEqual(19);

      userDB = await utilisateurRepository.getById('4', [Scope.ALL]);
      expect(userDB.mode_inscription).toEqual(ModeInscription.mot_de_passe);
      expect(userDB.version).toEqual(19);
    });
    */

    it.skip('migration V20 OK - recalcul des tags de reco', async () => {
      // GIVEN
      TestUtil.token = process.env.CRON_API_KEY;
      const logement: Logement_v0 = {
        version: 0,
        superficie: Superficie.superficie_150,
        type: TypeLogement.maison,
        code_postal: '21000',
        chauffage: Chauffage.bois,
        dpe: DPE.B,
        nombre_adultes: 2,
        nombre_enfants: 2,
        plus_de_15_ans: true,
        proprietaire: true,
        latitude: 48,
        longitude: 2,
        numero_rue: '12',
        rue: 'avenue de la Paix',
        code_commune: '91477',
        score_risques_adresse: undefined,
        prm: undefined,
        est_prm_obsolete: false,
        est_prm_par_adresse: false,
        liste_adresses_recentes: [],
      };

      await TestUtil.create(DB.utilisateur, {
        version: 19,
        migration_enabled: true,
        logement: logement as any,
      });
      App.USER_CURRENT_VERSION = 20;

      // WHEN
      const response = await TestUtil.POST('/admin/migrate_users');

      // THEN
      expect(response.status).toBe(201);
      expect(response.body).toEqual([
        {
          user_id: 'utilisateur-id',
          migrations: [
            {
              version: 20,
              ok: true,
              info: 'updated recos tags',
            },
          ],
        },
      ]);
      const userDB = await utilisateurRepository.getById('utilisateur-id', [
        Scope.ALL,
      ]);
      expect(userDB.recommandation.getListeTagsActifs()).toEqual([
        Tag_v2.habite_zone_urbaine,
      ]);
      expect(userDB.version).toEqual(20);
    });

    /*
    it('migration V21 OK - fusionne les actions exclues dans une liste globale', async () => {
      // GIVEN
      TestUtil.token = process.env.CRON_API_KEY;
      App.USER_CURRENT_VERSION = 21;

      const thematique_history1: ThematiqueHistory_v0 = {
        version: 0,
        codes_actions_exclues: undefined,
        liste_actions_utilisateur: [],
        recommandations_winter: [],
        liste_thematiques: [
          {
            thematique: Thematique.alimentation,
            codes_actions_exclues: [
              {
                action: { code: '1', type: TypeAction.classique },
                date: new Date(1),
              },
            ],
            first_personnalisation_date: new Date(2),
            personnalisation_done_once: true,
          },
          {
            thematique: Thematique.logement,
            codes_actions_exclues: [
              {
                action: { code: '2', type: TypeAction.bilan },
                date: new Date(3),
              },
            ],
            first_personnalisation_date: new Date(4),
            personnalisation_done_once: true,
          },
        ],
      };

      await TestUtil.create(DB.utilisateur, {
        version: 20,
        migration_enabled: true,
        thematique_history: thematique_history1 as any,
      });

      // WHEN
      const response = await TestUtil.POST('/admin/migrate_users');

      // THEN
      expect(response.status).toBe(201);
      expect(response.body).toEqual([
        {
          user_id: 'utilisateur-id',
          migrations: [
            {
              version: 21,
              ok: true,
              info: 'fusion actions exclues',
            },
          ],
        },
      ]);
      const userDB = await utilisateurRepository.getById('utilisateur-id', [
        Scope.ALL,
      ]);
      expect(userDB.thematique_history.getAllTypeCodeActionsExclues()).toEqual([
        {
          code: '1',
          type: 'classique',
        },
        {
          code: '2',
          type: 'bilan',
        },
      ]);
      expect(userDB.version).toEqual(21);
    });
    */

    it("migration V22 OK - remplace 'peu' en 'zero'", async () => {
      // GIVEN
      TestUtil.token = process.env.CRON_API_KEY;
      App.USER_CURRENT_VERSION = 22;

      const reponses = [
        {
          label: 'Une poubelle de 50L par semaine',
          code: '50L',
          ngc_code: 'base',
        },
        {
          label: 'Une poubelle de 20L par semaine',
          code: '20L',
          ngc_code: 'réduction',
        },
        {
          label: "Environ une poignée ou l'équivalent d'un bol par semaine",
          code: 'peu',
          ngc_code: 'zéro déchet',
        },
        {
          label: 'Zéro',
          code: 'zero',
          ngc_code: 'zéro déchet',
        },
        {
          label: 'Je ne sais pas',
          code: 'je_ne_sais_pas',
        },
      ];

      const kyc_gaspillage_alimentaire = TestUtil.kycData({
        code: KYCID.KYC_gaspillage_alimentaire_frequence,
        id_cms: 1,
        question: `À quelle fréquence jettez-vous des aliments ?`,
        type: TypeReponseQuestionKYC.choix_unique,
        is_ngc: true,
        ngc_key: 'alimentation',
        categorie: Categorie.test,
        image_url: null,
        emoji: null,
        reponses,
      });

      const answerGaspillageAlimentaire = (
        code:
          | 'je_ne_sais_pas'
          | 'zero'
          | 'peu'
          | '20L'
          | '50L' = 'je_ne_sais_pas',
      ): QuestionKYC_v2 => ({
        ...KYC_DATA,
        code: KYCID.KYC_gaspillage_alimentaire_frequence,
        id_cms: 1,
        question: `À quelle fréquence jettez-vous des aliments ?`,
        type: TypeReponseQuestionKYC.choix_unique,
        is_NGC: true,
        ngc_key: 'alimentation',
        image_url: null,
        reponse_complexe: reponses.map((r: any) => ({
          label: r.label,
          code: r.code,
          selected: r.code === code,
        })),
      });

      await TestUtil.create(DB.kYC, kyc_gaspillage_alimentaire as any);

      await TestUtil.create(DB.utilisateur, {
        version: 21,
        id: 'user-1',
        email: 'user-1@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [answerGaspillageAlimentaire()],
        } as any,
      });
      await TestUtil.create(DB.utilisateur, {
        version: 21,
        id: 'user-2',
        email: 'user-2@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [answerGaspillageAlimentaire('peu')],
        } as any,
      });
      await TestUtil.create(DB.utilisateur, {
        version: 21,
        id: 'user-3',
        email: 'user-3@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [answerGaspillageAlimentaire('zero')],
        } as any,
      });
      await kycRepository.loadCache();
      await TestUtil.create(DB.utilisateur, {
        version: 21,
        id: 'user-4',
        email: 'user-4@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [],
        } as any,
      });
      await kycRepository.loadCache();

      // WHEN
      const response = await TestUtil.POST('/admin/migrate_users');

      // THEN
      expect(response.status).toBe(201);
      response.body.sort((a, b) => a.user_id.localeCompare(b.user_id));
      expect(response.body).toEqual([
        {
          user_id: 'user-1',
          migrations: [
            {
              version: 22,
              ok: true,
              info: 'Correctly migrate answers for the KYC: KYC_gaspillage_alimentaire_frequence',
            },
          ],
        },
        {
          user_id: 'user-2',
          migrations: [
            {
              version: 22,
              ok: true,
              info: 'Correctly migrate answers for the KYC: KYC_gaspillage_alimentaire_frequence',
            },
          ],
        },
        {
          user_id: 'user-3',
          migrations: [
            {
              version: 22,
              ok: true,
              info: 'Correctly migrate answers for the KYC: KYC_gaspillage_alimentaire_frequence',
            },
          ],
        },
        {
          user_id: 'user-4',
          migrations: [
            {
              version: 22,
              ok: true,
              info: 'Correctly migrate answers for the KYC: KYC_gaspillage_alimentaire_frequence',
            },
          ],
        },
      ]);

      const user1 = await utilisateurRepository.getById('user-1', [Scope.ALL]);
      const kyc = user1.kyc_history.getAnsweredKYCs()[0];
      expect(kyc.code).toEqual(KYCID.KYC_gaspillage_alimentaire_frequence);
      expect(kyc.getSelectedCode()).toEqual('je_ne_sais_pas');
      expect(user1.version).toEqual(22);

      const user2 = await utilisateurRepository.getById('user-2', [Scope.ALL]);
      const kyc2 = user2.kyc_history.getAnsweredKYCs()[0];
      expect(kyc2.code).toEqual(KYCID.KYC_gaspillage_alimentaire_frequence);
      expect(kyc2.getSelectedCode()).toEqual('zero');
      expect(user2.version).toEqual(22);

      const user3 = await utilisateurRepository.getById('user-3', [Scope.ALL]);
      const kyc3 = user3.kyc_history.getAnsweredKYCs()[0];
      expect(kyc3.code).toEqual(KYCID.KYC_gaspillage_alimentaire_frequence);
      expect(kyc3.getSelectedCode()).toEqual('zero');
      expect(user3.version).toEqual(22);

      const user4 = await utilisateurRepository.getById('user-4', [Scope.ALL]);
      expect(user4.kyc_history.getAnsweredKYCs()).toHaveLength(0);
    });

    it("migration V23 OK - remplace 'hybride' en 'hybride_non_rechargeable'", async () => {
      // GIVEN
      TestUtil.token = process.env.CRON_API_KEY;
      App.USER_CURRENT_VERSION = 23;

      const reponses = [
        {
          label: 'Thermique',
          code: 'thermique',
          ngc_code: 'thermique',
        },
        {
          label: 'Hybride rechargeable',
          code: 'hybride_rechargeable',
          ngc_code: 'hybride rechargeable',
        },
        {
          label: 'Hybride non rechargeable',
          code: 'hybride_non_rechargeable',
          ngc_code: 'hybride non rechargeable',
        },
        // outdated
        {
          label: 'Hybride',
          code: 'hybride',
          ngc_code: 'hybride',
        },
        {
          label: 'Électrique',
          code: 'electrique',
          ngc_code: 'électrique',
        },
      ];

      const kyc_voiture_motorisation = TestUtil.kycData({
        code: KYCID.KYC_transport_voiture_motorisation,
        id_cms: 1,
        question: `Quelle est la motorisation de votre voiture ?`,
        type: TypeReponseQuestionKYC.choix_unique,
        is_ngc: true,
        ngc_key: 'transport . voiture . motorisation',
        categorie: Categorie.test,
        image_url: null,
        emoji: null,
        reponses,
      });

      const answerVoitureMotorisation = (
        code: 'thermique' | 'hybride' | 'electrique' = 'thermique',
      ): QuestionKYC_v2 => ({
        ...KYC_DATA,
        code: KYCID.KYC_transport_voiture_motorisation,
        id_cms: 1,
        question: `Quelle est la motorisation de votre voiture ?`,
        type: TypeReponseQuestionKYC.choix_unique,
        is_NGC: true,
        ngc_key: 'transport . voiture . motorisation',
        image_url: null,
        reponse_complexe: reponses.map((r: any) => ({
          label: r.label,
          code: r.code,
          selected: r.code === code,
        })),
      });

      await TestUtil.create(DB.kYC, kyc_voiture_motorisation as any);

      await TestUtil.create(DB.utilisateur, {
        version: 22,
        id: 'user-1',
        email: 'user-1@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [answerVoitureMotorisation()],
        } as any,
      });
      await TestUtil.create(DB.utilisateur, {
        version: 22,
        id: 'user-2',
        email: 'user-2@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [answerVoitureMotorisation('hybride')],
        } as any,
      });
      await TestUtil.create(DB.utilisateur, {
        version: 22,
        id: 'user-3',
        email: 'user-3@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [answerVoitureMotorisation('electrique')],
        } as any,
      });
      await kycRepository.loadCache();
      await TestUtil.create(DB.utilisateur, {
        version: 22,
        id: 'user-4',
        email: 'user-4@mail',
        migration_enabled: true,
        kyc: {
          version: 2,
          answered_questions: [],
        } as any,
      });
      await kycRepository.loadCache();

      // WHEN
      const response = await TestUtil.POST('/admin/migrate_users');

      // THEN
      expect(response.status).toBe(201);
      response.body.sort((a, b) => a.user_id.localeCompare(b.user_id));
      expect(response.body).toEqual([
        {
          user_id: 'user-1',
          migrations: [
            {
              info: 'Correctly migrate answers for the KYC: KYC_transport_voiture_motorisation',
              ok: true,
              version: 23,
            },
          ],
        },
        {
          user_id: 'user-2',
          migrations: [
            {
              info: 'Correctly migrate answers for the KYC: KYC_transport_voiture_motorisation',
              ok: true,
              version: 23,
            },
          ],
        },
        {
          user_id: 'user-3',
          migrations: [
            {
              info: 'Correctly migrate answers for the KYC: KYC_transport_voiture_motorisation',
              ok: true,
              version: 23,
            },
          ],
        },
        {
          user_id: 'user-4',
          migrations: [
            {
              info: 'Correctly migrate answers for the KYC: KYC_transport_voiture_motorisation',
              ok: true,
              version: 23,
            },
          ],
        },
      ]);

      const user1 = await utilisateurRepository.getById('user-1', [Scope.ALL]);
      const kyc = user1.kyc_history.getAnsweredKYCs()[0];
      expect(kyc.code).toEqual(KYCID.KYC_transport_voiture_motorisation);
      expect(kyc.getSelectedCode()).toEqual('thermique');
      expect(user1.version).toEqual(23);

      const user2 = await utilisateurRepository.getById('user-2', [Scope.ALL]);
      const kyc2 = user2.kyc_history.getAnsweredKYCs()[0];
      expect(kyc2.code).toEqual(KYCID.KYC_transport_voiture_motorisation);
      expect(kyc2.getSelectedCode()).toEqual('hybride_non_rechargeable');
      expect(user2.version).toEqual(23);

      const user3 = await utilisateurRepository.getById('user-3', [Scope.ALL]);
      const kyc3 = user3.kyc_history.getAnsweredKYCs()[0];
      expect(kyc3.code).toEqual(KYCID.KYC_transport_voiture_motorisation);
      expect(kyc3.getSelectedCode()).toEqual('electrique');
      expect(user3.version).toEqual(23);

      const user4 = await utilisateurRepository.getById('user-4', [Scope.ALL]);
      expect(user4.kyc_history.getAnsweredKYCs()).toHaveLength(0);
    });
  });

  it.skip('migration V24 OK - reprise donnée vetements mosaic', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    App.USER_CURRENT_VERSION = 24;

    const user_base_kyc = {
      code: KYCID.KYC_achat_robe,
      id_cms: 1,
      categorie: undefined,
      question: '',
      sous_titre: 'sous',
      reponse_simple: {
        value: '1',
      },
      reponse_complexe: undefined,
      type: TypeReponseQuestionKYC.entier,
      conditions: undefined,
      is_NGC: true,
      last_update: new Date(1),
      points: 5,
      tags: [],
      thematique: Thematique.consommation,
    };
    const kyc_user: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],
      answered_mosaics: [KYCMosaicID.MOSAIC_VETEMENTS],
      answered_questions: [
        { ...user_base_kyc, code: KYCID.KYC_achat_robe },
        { ...user_base_kyc, code: KYCID.KYC_achat_manteau },
        { ...user_base_kyc, code: KYCID.KYC_achat_chemise },
        { ...user_base_kyc, code: KYCID.KYC_achat_pantalon },
        { ...user_base_kyc, code: KYCID.KYC_achat_sweat },
      ],
    };

    const db_base_kyc = {
      code: KYCID.KYC_achat_robe,
      id_cms: 1,
      question: '',
      reponses: [],
      type: TypeReponseQuestionKYC.entier,
      conditions: undefined,
      points: 5,
      tags: [],
      thematique: Thematique.consommation,
    };

    await TestUtil.create(DB.kYC, {
      ...db_base_kyc,
      code: KYCID.KYC_achat_robe,
      id_cms: 1,
    });
    await TestUtil.create(DB.kYC, {
      ...db_base_kyc,
      code: KYCID.KYC_achat_manteau,
      id_cms: 2,
    });
    await TestUtil.create(DB.kYC, {
      ...db_base_kyc,
      code: KYCID.KYC_achat_chemise,
      id_cms: 3,
    });
    await TestUtil.create(DB.kYC, {
      ...db_base_kyc,
      code: KYCID.KYC_achat_pantalon,
      id_cms: 4,
    });
    await TestUtil.create(DB.kYC, {
      ...db_base_kyc,
      code: KYCID.KYC_achat_sweat,
      id_cms: 5,
    });

    const KYC_DB_DATA_VET: KYC = {
      id_cms: 10,
      code: KYCID.KYC_raison_achat_vetements,
      a_supprimer: false,
      categorie: Categorie.mission,
      conditions: undefined,
      emoji: 'a',
      image_url: 'img',
      is_ngc: true,
      ngc_key: 'a . b . c',
      points: 123,
      short_question: 'short',
      sous_titre: 'sous',
      tags: ['A'],
      thematique: Thematique.dechet,
      unite: { abreviation: 'kg' },
      type: TypeReponseQuestionKYC.choix_unique,
      question: `Type achat vetements`,
      reponses: [
        { label: 'un peu', code: 'minimum' },
        { label: 'moyen', code: 'occasionnel' },
        { label: 'beaucoup', code: 'accro' },
      ],
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.kYC, KYC_DB_DATA_VET);

    await TestUtil.create(DB.utilisateur, {
      version: 23,
      email: 'user-2@mail',
      migration_enabled: true,
      kyc: kyc_user as any,
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        migrations: [
          {
            info: 'filled KYC_raison_achat_vetements with score 5',
            ok: true,
            version: 24,
          },
        ],
        user_id: 'utilisateur-id',
      },
    ]);

    const user1 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user1.version).toEqual(24);

    const kyc_vet = user1.kyc_history.getQuestionChoixUnique(
      KYCID.KYC_raison_achat_vetements,
    );

    expect(kyc_vet.isAnswered()).toEqual(true);
    expect(kyc_vet.getSelectedCode()).toEqual('occasionnel');
  });

  it('migration V25 OK - remplace vie_en_famille par vit_en_famille', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    App.USER_CURRENT_VERSION = 25;

    const menage_kyc = {
      id_cms: 1,
      code: KYCID.KYC_menage,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.recommandation,
      points: 0,
      is_ngc: false,
      sous_titre: 'sous',
      tags: [],
      thematique: Thematique.logement,
      conditions: undefined,
      question: 'Combien dans le ménage',
      reponse_complexe: undefined,
    };

    await TestUtil.create(DB.kYC, menage_kyc);
    const kyc_user: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],
      answered_mosaics: [],
      answered_questions: [
        {
          ...menage_kyc,
          is_NGC: false,
          last_update: new Date(),
          reponse_simple: {
            value: '3',
          },
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      version: 24,
      email: 'user-2@mail',
      migration_enabled: true,
      kyc: kyc_user as any,
      recommandation: {
        version: 0,
        liste_tags_actifs: [
          Tag_v2.vie_en_famille,
          Tag_v2.habite_en_metropole,
          Tag_v2.habite_zone_urbaine,
        ],
      },
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        migrations: [
          {
            info: 'updated tag vie_en_famille to vit_en_famille',
            ok: true,
            version: 25,
          },
        ],
        user_id: 'utilisateur-id',
      },
    ]);

    const user1 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user1.version).toEqual(25);
    expect(user1.recommandation.getListeTagsActifs()).toEqual([
      Tag_v2.vit_en_famille,
      Tag_v2.habite_zone_urbaine,
      Tag_v2.habite_en_metropole,
    ]);
  });

  it('migration V26 OK - web_ngc => referer = ngc', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    App.USER_CURRENT_VERSION = 26;

    await TestUtil.create(DB.utilisateur, {
      version: 25,
      migration_enabled: true,
      source_inscription: SourceInscription.web_ngc,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        migrations: [
          {
            info: 'done',
            ok: true,
            version: 26,
          },
        ],
        user_id: 'utilisateur-id',
      },
    ]);

    const user1 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user1.version).toEqual(26);
    expect(user1.referer).toEqual('ngc');
    expect(user1.source_inscription).toEqual(SourceInscription.web_ngc);
  });

  it('migration V27 OK - web_ngc => web', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    App.USER_CURRENT_VERSION = 27;

    await TestUtil.create(DB.utilisateur, {
      version: 26,
      migration_enabled: true,
      source_inscription: SourceInscription.web_ngc,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/migrate_users');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      {
        migrations: [
          {
            info: 'done',
            ok: true,
            version: 27,
          },
        ],
        user_id: 'utilisateur-id',
      },
    ]);

    const user1 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user1.version).toEqual(27);
    expect(user1.source_inscription).toEqual('web');
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

  it('POST /admin/contacts/synchronize - synchro user dans Brevo', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, { brevo_created_at: new Date() });

    // WHEN
    const response = await TestUtil.POST('/admin/contacts/synchronize');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body).toEqual([
      'SKIP updating Brevo contact [yo@truc.com]',
    ]);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.brevo_updated_at).toEqual(null);
  });

  it('POST /admin/contacts/synchronize - synchro user dans Brevo skip si deja synchro', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, {
      brevo_updated_at: new Date(456),
      derniere_activite: new Date(123),
    });

    // WHEN
    const response = await TestUtil.POST('/admin/contacts/synchronize');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(0);
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

  it('POST /admin/forcer_calcul_stats_carbone', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const cache: CacheBilanCarbone_v0 = {
      version: 0,
      total_kg: 0,
      transport_kg: 0,
      alimentation_kg: 0,
      logement_kg: 0,
      consommation_kg: 0,
      updated_at: new Date(1),
      est_bilan_complet: false,
      forcer_calcul_stats: false,
    };
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'A',
      email: '1',
      cache_bilan_carbone: cache as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'B',
      email: '2',
      cache_bilan_carbone: cache as any,
    });
    // WHEN
    const response = await TestUtil.POST('/admin/forcer_calcul_stats_carbone');

    // THEN
    expect(response.status).toBe(201);
    const listeUsers = await TestUtil.prisma.utilisateur.findMany({
      orderBy: {
        id: 'asc',
      },
    });
    expect(listeUsers[0].cache_bilan_carbone['forcer_calcul_stats']).toEqual(
      true,
    );
    expect(listeUsers[1].cache_bilan_carbone['forcer_calcul_stats']).toEqual(
      true,
    );
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
    expect(response.body[0]).toEqual('[email2] CREATE SKIPPED');
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

  it('GET extract les utilisateurs avec voiture', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],

      answered_questions: [
        {
          code: KYCID.KYC_transport_voiture_km,
          question: `km voituyre`,
          sous_titre: 'sous',
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
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
          vue_le: new Date(),
          faite_le: null,
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
        {
          action: { type: TypeAction.classique, code: '2' },
          vue_le: null,
          faite_le: new Date(),
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
      ],
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
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
          vue_le: new Date(),
          faite_le: new Date(),
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
      ],
      liste_thematiques: [],
    };

    const thematique_history2: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
          vue_le: new Date(),
          faite_le: null,
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
        {
          action: { type: TypeAction.classique, code: '2' },
          vue_le: new Date(),
          faite_le: null,
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
      ],
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

  it('POST /admin/compute_all_aides_communes_from_partenaires', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.aide, {
      besoin: Besoin.acheter_velo,
      besoin_desc: 'hihi',
      codes_departement: [],
      codes_postaux: [],
      codes_region: [],
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],
      content_id: '1',
      contenu: 'haha',
      date_expiration: new Date(),
      derniere_maj: new Date(),
      echelle: Echelle.Commune,
      est_gratuit: false,
      exclude_codes_commune: [],
      include_codes_commune: [],
      is_simulateur: false,
      montant_max: 1000,
      partenaires_supp_ids: ['1'],
      thematiques: [],
      titre: 'titre',
      url_demande: 'c',
      url_simulateur: 'a',
      url_source: 'b',
      question_accroche: 'question_accroche',
      introduction: 'introduction',
      explication: 'explication',
      conditions_eligibilite: 'conditions_eligibilite',
      equipements_eligibles: 'equipements_eligibles',
      travaux_eligibles: 'travaux_eligibles',
      montant: 'montant',
      en_savoir_plus: 'en_savoir_plus',
      description_courte: 'description_courte',
    });

    await TestUtil.create(DB.partenaire, {
      content_id: '1',
      code_epci: '242100410',
      code_commune: '91477',
      code_departement: '123',
      code_region: '456',
    });

    // WHEN
    const response = await TestUtil.POST(
      '/admin/compute_all_aides_communes_from_partenaires',
    );

    // THEN
    expect(response.status).toBe(201);
    const aideDB = (await TestUtil.prisma.aide.findMany())[0];
    delete aideDB.date_expiration;
    delete aideDB.updated_at;
    delete aideDB.created_at;
    delete aideDB.derniere_maj;

    expect(aideDB).toEqual({
      besoin: 'acheter_velo',
      besoin_desc: 'hihi',
      codes_departement: [],
      codes_postaux: [],
      codes_region: [],
      codes_commune_from_partenaire: TestUtil.CODE_COMMUNE_FROM_PARTENAIRE,
      codes_departement_from_partenaire: ['123'],
      codes_region_from_partenaire: ['456'],
      content_id: '1',
      contenu: 'haha',
      echelle: 'Commune',
      est_gratuit: false,
      exclude_codes_commune: [],
      include_codes_commune: [],
      is_simulateur: false,
      montant_max: 1000,
      partenaires_supp_ids: ['1'],
      thematiques: [],
      titre: 'titre',
      url_demande: 'c',
      url_simulateur: 'a',
      url_source: 'b',
      VISIBLE_PROD: true,
      question_accroche: 'question_accroche',
      introduction: 'introduction',
      explication: 'explication',
      conditions_eligibilite: 'conditions_eligibilite',
      equipements_eligibles: 'equipements_eligibles',
      travaux_eligibles: 'travaux_eligibles',
      montant: 'montant',
      en_savoir_plus: 'en_savoir_plus',
      description_courte: 'description_courte',
    });
  });

  it('POST /admin/compute_all_articles_communes_from_partenaires', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titre',
      contenu: 'haha',
      partenaire_id: 'p1',
    });
    await TestUtil.create(DB.partenaire, {
      content_id: 'p1',
      code_epci: '242100410',
      code_commune: '91477',
      code_departement: '123',
      code_region: '456',
    });

    // WHEN
    const response = await TestUtil.POST(
      '/admin/compute_all_articles_communes_from_partenaires',
    );

    // THEN
    expect(response.status).toBe(201);
    const articleDB = (await TestUtil.prisma.article.findMany())[0];

    expect(articleDB.content_id).toEqual('1');
    expect(articleDB.codes_commune_from_partenaire).toEqual(
      TestUtil.CODE_COMMUNE_FROM_PARTENAIRE,
    );
    expect(articleDB.codes_departement_from_partenaire).toEqual(['123']);
    expect(articleDB.codes_region_from_partenaire).toEqual(['456']);
  });

  it.skip('POST /admin/update_all_communes_risques', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/update_all_communes_risques');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      "Error computing risques communes for [utilisateur-id] : Le service externe 'Alentours / Catnat' semble rencontrer un problème, nous vous proposons de re-essayer plus tard",
    ]);
  });

  it.skip('POST /admin/update_all_communes_risques', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '12345',
      score_risques_adresse: undefined,
      prm: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/update_all_communes_risques');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      'Code commune absent pour [utilisateur-id]',
    ]);
  });

  it.skip('POST /admin/update_all_communes_risques', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,

      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/update_all_communes_risques');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      'Risques commune déjà pr�����sents pour [utilisateur-id]',
    ]);
  });

  it('POST /admin/re_inject_situations_NGC : OK si table vide de situation', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST('/admin/re_inject_situations_NGC');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([]);
  });
  it('POST /admin/re_inject_situations_NGC : rien si situation pas liée à un utilisateur', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC, {
      created_at: new Date(1),
      situation: {},
      id: '123',
      utilisateurId: null,
      updated_at: new Date(1),
    });

    // WHEN
    const response = await TestUtil.POST('/admin/re_inject_situations_NGC');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([]);
  });
  it(`POST /admin/re_inject_situations_NGC : maj d'une KYC`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC, {
      id: '123',
      utilisateurId: 'utilisateur-id',
      created_at: new Date(1),
      updated_at: new Date(1),
      situation: {
        'transport . voiture . km': 2999,
        'alimentation . de saison . consommation': "'bof'",
      },
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_transport_voiture_km,
      type: TypeReponseQuestionKYC.entier,
      is_ngc: true,
      question: `Km en voiture ?`,
      points: 10,
      categorie: Categorie.test,
      reponses: [],
      ngc_key: 'transport . voiture . km',
    });
    await TestUtil.create(DB.kYC, {
      code: 'KYC_saison_frequence',
      id_cms: 2,
      question: `À quelle fréquence mangez-vous de saison ? `,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      reponses: [
        { label: 'Souvent', code: 'souvent', ngc_code: "'souvent'" },
        { label: 'Jamais', code: 'jamais', ngc_code: "'bof'" },
        { label: 'Parfois', code: 'parfois', ngc_code: "'burp'" },
      ],
      tags: [],
      ngc_key: 'alimentation . de saison . consommation',
      conditions: [],
      is_ngc: true,
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST('/admin/re_inject_situations_NGC');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      'Set on user utilisateur-id : transport . voiture . km|alimentation . de saison . consommation',
    ]);

    const user_DB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      user_DB.kyc_history
        .getQuestionNumerique('KYC_transport_voiture_km')
        .getValue(),
    ).toEqual(2999);
    expect(
      user_DB.kyc_history.getQuestion('KYC_saison_frequence').getSelectedCode(),
    ).toEqual('jamais');
  });

  it(`POST /admin/liste_questions_utilisateur`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: {
            code: '123',
            type: TypeAction.classique,
          },
          faite_le: new Date(1),
          feedback: null,
          like_level: null,
          vue_le: null,
          liste_partages: [],
          liste_questions: [
            {
              date: new Date(123),
              est_action_faite: true,
              question: 'mais quoi donc ?',
            },
          ],
        },
      ],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.utilisateur, {
      thematique_history: thematique_history as any,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });

    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/admin/liste_questions_utilisateur');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        action_cms_id: '111',
        action_faite: true,
        action_titre: '**The titre**',
        date: '1970-01-01T00:00:00.123Z',
        email: 'yo@truc.com',
        nom: 'nom',
        prenom: 'prenom',
        pseudo: 'pseudo',
        question: 'mais quoi donc ?',
      },
    ]);
  });

  it(`POST /admin/refresh_all_user_tags`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '21231',
      score_risques_adresse: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/refresh_all_user_tags');

    // THEN
    expect(response.status).toBe(201);
    const user_DB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(user_DB.recommandation.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_urbaine,
      Tag_v2.habite_en_metropole,
    ]);
  });
});
