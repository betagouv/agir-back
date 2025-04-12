import { KYC } from '@prisma/client';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { CacheBilanCarbone_v0 } from '../../../src/domain/object_store/bilan/cacheBilanCarbone_v0';
import { History_v0 } from '../../../src/domain/object_store/history/history_v0';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { TagExcluant } from '../../../src/domain/scoring/tagExcluant';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { NGCCalculator } from '../../../src/infrastructure/ngc/NGCCalculator';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { AideRepository } from '../../../src/infrastructure/repository/aide.repository';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';
import { StatistiqueExternalRepository } from '../../../src/infrastructure/repository/statitstique.external.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneUsecase } from '../../../src/usecase/bilanCarbone.usecase';
import { DuplicateBDDForStatsUsecase } from '../../../src/usecase/stats/new/duplicateBDD.usecase';
import { DB, TestUtil } from '../../TestUtil';

const KYC_DATA: QuestionKYC_v2 = {
  code: '1',
  last_update: undefined,
  id_cms: 11,
  question: `question`,
  type: TypeReponseQuestionKYC.choix_unique,
  is_NGC: false,
  a_supprimer: false,
  categorie: Categorie.test,
  points: 10,
  reponse_complexe: undefined,
  reponse_simple: undefined,
  tags: [],
  thematique: Thematique.consommation,
  ngc_key: '123',
  short_question: 'short',
  image_url: 'AAA',
  conditions: [],
  unite: { abreviation: 'kg' },
  emoji: '🔥',
};

const kyc_histo: KYCHistory_v2 = {
  version: 2,
  answered_mosaics: [],
  answered_questions: [
    {
      ...KYC_DATA,
      code: 'KYC_saison_frequence',
      id_cms: 21,
      type: TypeReponseQuestionKYC.choix_unique,
      is_NGC: true,
      last_update: new Date(1000),
      reponse_complexe: [
        {
          label: 'Souvent',
          code: 'souvent',
          ngc_code: '"souvent"',
          selected: true,
        },
        {
          label: 'Jamais',
          code: 'jamais',
          ngc_code: '"bof"',
          selected: false,
        },
        {
          label: 'Parfois',
          code: 'parfois',
          ngc_code: '"burp"',
          selected: false,
        },
      ],
      tags: [],
      ngc_key: 'alimentation . de saison . consommation',
    },
  ],
};

const kyc_part_of_histo: KYC = {
  code: 'KYC_saison_frequence',
  id_cms: 21,
  question: `À quelle fréquence mangez-vous de saison ? `,
  type: TypeReponseQuestionKYC.choix_unique,
  categorie: Categorie.mission,
  points: 10,
  reponses: [
    { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
    { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
    { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
  ],
  tags: [],
  ngc_key: 'alimentation . de saison . consommation',
  image_url: '111',
  short_question: 'short',
  conditions: [],
  unite: { abreviation: 'kg' },
  created_at: undefined,
  is_ngc: true,
  a_supprimer: false,
  thematique: 'alimentation',
  updated_at: undefined,
  emoji: '🔥',
};

describe('Duplicate Usecase', () => {
  let statistiqueExternalRepository = new StatistiqueExternalRepository(
    TestUtil.prisma_stats,
    new CommuneRepository(TestUtil.prisma),
  );
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const aideRepository = new AideRepository(TestUtil.prisma);
  const quizzRepository = new QuizzRepository(TestUtil.prisma);
  const nGCCalculator = new NGCCalculator();
  const bilanCarboneUsecase = new BilanCarboneUsecase(
    nGCCalculator,
    utilisateurRepository,
  );

  let duplicateUsecase = new DuplicateBDDForStatsUsecase(
    utilisateurRepository,
    statistiqueExternalRepository,
    actionRepository,
    articleRepository,
    aideRepository,
    quizzRepository,
    bilanCarboneUsecase,
    nGCCalculator,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('duplicateUtilisateur : copy ok si moins de user que block size', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      external_stat_id: '123',
      code_commune: '21231',
      derniere_activite: new Date(1),
      rank_commune: 12,
      rank: 123,
      created_at: new Date(2),
    });

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(5);

    // THEN
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(stats_users).toHaveLength(1);

    const user = stats_users[0];
    expect(user.nombre_parts_fiscales.toNumber()).toEqual(2);
    delete user.nombre_parts_fiscales;

    expect(user).toEqual({
      code_insee_commune: '21231',
      code_postal: '91120',
      compte_actif: true,
      date_derniere_activite: new Date(1),
      user_id: '123',
      nom_commune: 'PALAISEAU',
      nombre_points: 10,
      revenu_fiscal: 10000,
      source_inscription: 'web',
      code_departement: '21',
      rang_commune: 12,
      rang_national: 123,
      date_inscription: new Date(2),
    });
  });

  it(`duplicateUtilisateur : copy ok si plus d'utilisateuts que block size`, async () => {
    // GIVEN
    for (let index = 0; index < 10; index++) {
      await TestUtil.create(DB.utilisateur, {
        id: 'id_' + index,
        external_stat_id: 'stat_id_' + index,
        code_commune: '456',
        email: 'email_' + index,
      });
    }

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(7);

    // THEN
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(stats_users).toHaveLength(10);
  });
  it(`duplicateUtilisateur : genere un id externe si nécessaire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      external_stat_id: null,
    });

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(5);

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findMany();
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(userDB[0].external_stat_id).not.toBeNull();
    expect(userDB[0].external_stat_id.length).toBeGreaterThan(20);
    expect(stats_users[0].user_id).toEqual(userDB[0].external_stat_id);
  });

  it('duplicateKYC : ne copie pas la KYC si répondu il y a plus de 2 jours', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.choix_unique,
          last_update: new Date(1),
          thematique: Thematique.alimentation,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              selected: true,
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: false,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(0);
  });

  it('duplicateKYC : copy ok 1 KYC de type choix unique', async () => {
    // GIVEN
    const last_update = new Date(Date.now() - 1000);
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.choix_unique,
          last_update: last_update,
          thematique: Thematique.alimentation,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              selected: true,
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: false,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.user_id).toEqual('123');
    expect(kycDB.code_kyc).toEqual('1');
    expect(kycDB.cms_id).toEqual('10');
    expect(kycDB.question).toEqual('question');
    expect(kycDB.thematique).toEqual(Thematique.alimentation);
    expect(kycDB.type_question).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(kycDB.derniere_mise_a_jour).toEqual(last_update);
    expect(kycDB.reponse_unique_code).toEqual('climat');
  });

  it('duplicateKYC : copy ok 1 KYC de type choix multiple', async () => {
    // GIVEN
    const last_update = new Date(Date.now() - 1000);
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.choix_multiple,
          last_update: last_update,
          thematique: Thematique.alimentation,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              selected: true,
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: false,
            },
            {
              label: 'Mon logement',
              code: 'toto',
              selected: true,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_multiple_code).toEqual(['climat', 'toto']);
  });

  it('duplicateKYC : copy ok 1 KYC de type entier', async () => {
    // GIVEN
    const last_update = new Date(Date.now() - 1000);
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.entier,
          last_update: last_update,
          thematique: Thematique.alimentation,
          reponse_simple: {
            value: '12',
          },
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_entier).toEqual(12);
  });
  it('duplicateKYC : copy ok 1 KYC de type decimal', async () => {
    // GIVEN
    const last_update = new Date(Date.now() - 1000);
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.decimal,
          last_update: last_update,
          thematique: Thematique.alimentation,
          reponse_simple: {
            value: '12.3',
          },
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_decimal).toEqual('12.3');
  });
  it('duplicateKYC : copy ok 1 KYC de type texte', async () => {
    // GIVEN
    const last_update = new Date(Date.now() - 1000);
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 10,
          type: TypeReponseQuestionKYC.libre,
          last_update: last_update,
          thematique: Thematique.alimentation,
          reponse_simple: {
            value: 'hello',
          },
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicateKYC(5);

    // THEN
    const stats_kycs = await TestUtil.prisma_stats.kYCCopy.findMany();

    expect(stats_kycs).toHaveLength(1);

    const kycDB = stats_kycs[0];
    expect(kycDB.reponse_texte).toEqual('hello');
  });

  it('duplicateAction : copy ok action utilisateur', async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          faite_le: new Date(123),
          vue_le: new Date(456),
          feedback: 'good',
          like_level: 3,
        },
      ],
      liste_tags_excluants: [],
      liste_thematiques: [],
    };
    await TestUtil.create(DB.utilisateur, {
      thematique_history: thematique_history as any,
      external_stat_id: '123',
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_1',
      cms_id: '1',
      code: '1',
      thematique: Thematique.alimentation,
      titre: 'yo',
    });
    await actionRepository.loadCache();

    // WHEN
    await duplicateUsecase.duplicateAction();

    // THEN
    const stats_actions = await TestUtil.prisma_stats.actionCopy.findMany();

    expect(stats_actions).toHaveLength(1);

    const actionDB = stats_actions[0];
    expect(actionDB).toEqual({
      cms_id: '1',
      code_action: '1',
      faite_le: new Date(123),
      thematique: 'alimentation',
      titre: 'yo',
      type_action: 'classique',
      type_code_id: 'classique_1',
      user_id: '123',
      vue_le: new Date(456),
      feedback: 'good',
      like_level: 3,
    });
  });
  it('duplicateArticle : copy ok articles utilisateur', async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      aide_interactions: [],
      quizz_interactions: [],
      article_interactions: [
        {
          content_id: '1',
          like_level: 2,
          read_date: new Date(123),
          favoris: true,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
      external_stat_id: '123',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      soustitre: 'sousTitre',
      thematique_principale: Thematique.climat,
      thematiques: [Thematique.climat, Thematique.logement],
      points: 10,
      image_url: 'https://',
    });
    await articleRepository.loadCache();

    // WHEN
    await duplicateUsecase.duplicateArticle();

    // THEN
    const stats = await TestUtil.prisma_stats.articleCopy.findMany();

    expect(stats).toHaveLength(1);

    const stat = stats[0];
    expect(stat).toEqual({
      cms_id: '1',
      est_favoris: true,
      like_level: 2,
      lu_le: new Date(123),
      thematique: 'climat',
      titre: 'titreA',
      user_id: '123',
    });
  });

  it('duplicateAide : copy ok aides utilisateur', async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      aide_interactions: [
        {
          clicked_demande: true,
          clicked_infos: false,
          vue_at: new Date(123),
          content_id: '1',
          est_connue_utilisateur: true,
          sera_sollicitee_utilisateur: false,
          feedback: 'good',
          like_level: 3,
        },
      ],
      quizz_interactions: [],
      article_interactions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
      external_stat_id: '123',
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      titre: 'titreA',
      thematiques: [Thematique.climat, Thematique.logement],
    });
    await aideRepository.loadCache();

    // WHEN
    await duplicateUsecase.duplicateAides();

    // THEN
    const stats = await TestUtil.prisma_stats.aideCopy.findMany();

    expect(stats).toHaveLength(1);

    const stat = stats[0];
    expect(stat).toEqual({
      clicked_demande: true,
      clicked_infos: false,
      cms_id: '1',
      thematiques: ['climat', 'logement'],
      titre: 'titreA',
      user_id: '123',
      vue_le: new Date(123),
      est_connue_utilisateur: true,
      feedback: 'good',
      like_level: 3,
      sera_sollicitee_utilisateur: false,
    });
  });

  it('duplicateQuizz : copy ok quizz utilisateur', async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      aide_interactions: [],
      quizz_interactions: [
        {
          content_id: '1',
          like_level: 2,
          attempts: [
            {
              score: 100,
              date: new Date(123),
            },
          ],
        },
      ],
      article_interactions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
      external_stat_id: '123',
    });
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      titre: 'titreA',
      thematique_principale: Thematique.climat,
    });
    await quizzRepository.loadCache();

    // WHEN
    await duplicateUsecase.duplicateQuizz();

    // THEN
    const stats = await TestUtil.prisma_stats.quizzCopy.findMany();

    expect(stats).toHaveLength(1);

    const stat = stats[0];
    expect(stat).toEqual({
      bon_premier_coup: true,
      cms_id: '1',
      date_premier_coup: new Date(123),
      like_level: 2,
      thematique: 'climat',
      titre: 'titreA',
      user_id: '123',
      nombre_tentatives: 1,
    });
  });

  it('computeBilanTousUtilisateurs : BC default', async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      external_stat_id: '123',
    });

    // WHEN
    const reponse = await duplicateUsecase.computeBilanTousUtilisateurs();

    // THEN
    const stats = await TestUtil.prisma_stats.bilanCarbone.findMany();

    expect(stats).toHaveLength(1);

    const stat = stats[0];
    delete stat.created_at;
    delete stat.updated_at;

    expect(stat).toEqual({
      alimentation_kg: NGCCalculator.DEFAULT_ALIMENTATION_KG_ROUND,
      consommation_kg: NGCCalculator.DEFAULT_CONSOMMATION_KG_ROUND,
      logement_kg: NGCCalculator.DEFAULT_LOGEMENT_KG_ROUND,
      total_kg: NGCCalculator.DEFAULT_TOTAL_KG_ROUND,
      transport_kg: NGCCalculator.DEFAULT_TRANSPORT_KG_ROUND,
      user_id: '123',
      pourcentage_progression_alimentation: 0,
      pourcentage_progression_consommation: 0,
      pourcentage_progression_logement: 0,
      pourcentage_progression_total: 0,
      pourcentage_progression_transport: 0,
    });
  });

  it('computeBilanTousUtilisateurs : BC avec une KYC', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: 'KYC_saison_frequence',
          id_cms: 21,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          reponse_complexe: [
            {
              label: 'Souvent',
              code: 'souvent',
              ngc_code: '"souvent"',
              selected: true,
            },
            {
              label: 'Jamais',
              code: 'jamais',
              ngc_code: '"bof"',
              selected: false,
            },
            {
              label: 'Parfois',
              code: 'parfois',
              ngc_code: '"burp"',
              selected: false,
            },
          ],
          tags: [],
          ngc_key: 'alimentation . de saison . consommation',
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC_saison_frequence',
      id_cms: 21,
      question: `À quelle fréquence mangez-vous de saison ? `,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      reponses: [
        { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
        { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
        { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
      ],
      tags: [],
      ngc_key: 'alimentation . de saison . consommation',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      unite: { abreviation: 'kg' },
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      external_stat_id: '123',
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await duplicateUsecase.computeBilanTousUtilisateurs();

    // THEN
    expect(response).toHaveLength(3);
    expect(response[0]).toEqual('Computed OK = [1]');
    expect(response[1]).toEqual('Skipped = [0]');
    expect(response[2]).toEqual('Errors = [0]');

    const stats = await TestUtil.prisma_stats.bilanCarbone.findMany();
    const stat = stats[0];
    delete stat.created_at;
    delete stat.updated_at;

    expect(stat).toEqual({
      alimentation_kg: 2302,
      consommation_kg: NGCCalculator.DEFAULT_CONSOMMATION_KG_ROUND,
      logement_kg: NGCCalculator.DEFAULT_LOGEMENT_KG_ROUND,
      total_kg: 8863,
      transport_kg: NGCCalculator.DEFAULT_TRANSPORT_KG_ROUND,
      user_id: '123',
      pourcentage_progression_alimentation: 50,
      pourcentage_progression_consommation: 0,
      pourcentage_progression_logement: 0,
      pourcentage_progression_total: 9,
      pourcentage_progression_transport: 0,
    });
  });

  it('computeBilanTousUtilisateurs : pas de reclalcul si pas besoin', async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, kyc_part_of_histo);

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc_histo as any,
      external_stat_id: '123',
    });

    await TestUtil.prisma_stats.bilanCarbone.create({
      data: {
        user_id: '123',
        alimentation_kg: 1,
        consommation_kg: 1,
        logement_kg: 1,
        transport_kg: 1,
        total_kg: 1,
        created_at: new Date(100),
        updated_at: new Date(2000),
      },
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await duplicateUsecase.computeBilanTousUtilisateurs();

    // THEN
    expect(response).toHaveLength(3);
    expect(response[0]).toEqual('Computed OK = [0]');
    expect(response[1]).toEqual('Skipped = [1]');
    expect(response[2]).toEqual('Errors = [0]');

    const stats = await TestUtil.prisma_stats.bilanCarbone.findMany();
    const stat = stats[0];
    delete stat.created_at;
    delete stat.updated_at;

    expect(stat).toEqual({
      alimentation_kg: 1,
      consommation_kg: 1,
      logement_kg: 1,
      total_kg: 1,
      transport_kg: 1,
      user_id: '123',
      pourcentage_progression_alimentation: 0,
      pourcentage_progression_consommation: 0,
      pourcentage_progression_logement: 0,
      pourcentage_progression_total: 0,
      pourcentage_progression_transport: 0,
    });
  });

  it('computeBilanTousUtilisateurs : pas de reclalcul si pas besoin => forcage de calcul', async () => {
    // GIVEN

    await TestUtil.create(DB.kYC, kyc_part_of_histo);

    const cache: CacheBilanCarbone_v0 = {
      version: 0,
      total_kg: 0,
      transport_kg: 0,
      alimentation_kg: 0,
      logement_kg: 0,
      consommation_kg: 0,
      updated_at: new Date(1),
      est_bilan_complet: false,
      forcer_calcul_stats: true,
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc_histo as any,
      cache_bilan_carbone: cache as any,
      external_stat_id: '123',
    });

    await TestUtil.prisma_stats.bilanCarbone.create({
      data: {
        user_id: '123',
        alimentation_kg: 1,
        consommation_kg: 1,
        logement_kg: 1,
        transport_kg: 1,
        total_kg: 1,
        created_at: new Date(100),
        updated_at: new Date(2000),
      },
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await duplicateUsecase.computeBilanTousUtilisateurs();

    // THEN
    expect(response).toHaveLength(3);
    expect(response[0]).toEqual('Computed OK = [1]');
    expect(response[1]).toEqual('Skipped = [0]');
    expect(response[2]).toEqual('Errors = [0]');

    const stats = await TestUtil.prisma_stats.bilanCarbone.findMany();
    const stat = stats[0];
    delete stat.created_at;
    delete stat.updated_at;

    expect(stat).toEqual({
      alimentation_kg: 2302,
      consommation_kg: NGCCalculator.DEFAULT_CONSOMMATION_KG_ROUND,
      logement_kg: NGCCalculator.DEFAULT_LOGEMENT_KG_ROUND,
      total_kg: 8863,
      transport_kg: NGCCalculator.DEFAULT_TRANSPORT_KG_ROUND,
      user_id: '123',
      pourcentage_progression_alimentation: 50,
      pourcentage_progression_consommation: 0,
      pourcentage_progression_logement: 0,
      pourcentage_progression_total: 9,
      pourcentage_progression_transport: 0,
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.cache_bilan_carbone).toEqual({
      alimentation_kg: 0,
      consommation_kg: 0,
      est_bilan_complet: false,
      forcer_calcul_stats: false,
      logement_kg: 0,
      total_kg: 0,
      transport_kg: 0,
      updated_at: new Date(1),
    });
  });

  it('computeBilanTousUtilisateurs : gestion erreurs', async () => {
    // GIVEN
    const kyc_bad: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: 'KYC alcool_bad',
          id_cms: 1,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: true,
          reponse_simple: {
            value: '10',
          },
          reponse_complexe: undefined,
          tags: [],
          ngc_key: 'alimentation . boisson . alcool . litres',
        },
      ],
    };
    const kyc_ok: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: 'KYC alcool_good',
          id_cms: 2,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: true,
          reponse_simple: {
            value: '5',
          },
          reponse_complexe: undefined,
          tags: [],
          ngc_key: 'alimentation . boisson . alcool . litres',
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC alcool_bad',
      id_cms: 1,
      question: `Combien de litres ^^`,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.mission,
      points: 10,
      reponses: [],
      tags: [],
      ngc_key: 'very bad key',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      unite: { abreviation: 'kg' },
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    await TestUtil.create(DB.kYC, {
      code: 'KYC alcool_good',
      id_cms: 2,
      question: `Combien de litres ^^`,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.mission,
      points: 10,
      reponses: [],
      tags: [],
      ngc_key: 'alimentation . boisson . alcool . litres',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      unite: { abreviation: 'kg' },
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc_bad as any,
      external_stat_id: '123',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      email: '2',
      kyc: kyc_ok as any,
      external_stat_id: '456',
    });

    await kycRepository.loadCache();

    // WHEN
    const response = await duplicateUsecase.computeBilanTousUtilisateurs();

    // THEN
    expect(response).toHaveLength(4);
    expect(response[0]).toEqual('Computed OK = [1]');
    expect(response[1]).toEqual('Skipped = [0]');
    expect(response[2]).toEqual('Errors = [1]');
    expect(response[3]).toEqual(
      'BC KO [utilisateur-id] : {"name":"SituationError","info":{"dottedName":"very bad key"}}',
    );

    const stats = await TestUtil.prisma_stats.bilanCarbone.findMany();
    expect(stats).toHaveLength(1);
  });

  it('duplicatePersonnalisation : copy les données de perso', async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_tags_excluants: [TagExcluant.a_un_jardin, TagExcluant.a_un_velo],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [
            {
              action: { code: 'abc', type: TypeAction.classique },
              date: new Date(1),
            },
          ],
          codes_actions_proposees: [],
          first_personnalisation_date: new Date(1),
          personnalisation_done: false,
          personnalisation_done_once: true,
        },
        {
          thematique: Thematique.logement,
          codes_actions_exclues: [
            {
              action: { code: 'def', type: TypeAction.bilan },
              date: new Date(1),
            },
          ],
          codes_actions_proposees: [],
          first_personnalisation_date: new Date(1),
          personnalisation_done: false,
          personnalisation_done_once: false,
        },
      ],
      liste_actions_utilisateur: [],
    };

    await TestUtil.create(DB.utilisateur, {
      thematique_history: thematique_history as any,
      external_stat_id: '123',
    });

    // WHEN
    await duplicateUsecase.duplicatePersonnalisation();

    // THEN
    const stats = await TestUtil.prisma_stats.personnalisation.findMany();

    expect(stats).toHaveLength(1);

    const stat = stats[0];
    expect(stat).toEqual({
      actions_alimentation_rejetees: ['abc'],
      actions_consommation_rejetees: [],
      actions_logement_rejetees: ['def'],
      actions_rejetees_all: ['abc', 'def'],
      actions_transport_rejetees: [],
      perso_alimentation_done_once: true,
      perso_consommation_done_once: false,
      perso_logement_done_once: false,
      perso_transport_done_once: false,
      tags_exclusion: ['a_un_jardin', 'a_un_velo'],
      user_id: '123',
    });
  });
});
