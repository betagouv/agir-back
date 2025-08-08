import {
  ActionBilanID,
  ActionSimulateurID,
  TypeAction,
} from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { KYCHistory_v2 } from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ProfileRecommandationUtilisateur_v0 } from '../../../src/domain/object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Tag_v2 } from '../../../src/domain/scoring/system_v2/Tag_v2';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionAPI } from '../../../src/infrastructure/api/types/actions/ActionAPI';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { BlockTextRepository } from '../../../src/infrastructure/repository/blockText.repository';
import { CompteurActionsRepository } from '../../../src/infrastructure/repository/compteurActions.repository';
import { FAQRepository } from '../../../src/infrastructure/repository/faq.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';
import { TagRepository } from '../../../src/infrastructure/repository/tag.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

const logement: Logement_v0 = {
  version: 0,
  superficie: Superficie.superficie_150,
  type: TypeLogement.maison,
  code_postal: '91120',
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
  prm: undefined,
  est_prm_obsolete: false,
  est_prm_par_adresse: false,
  liste_adresses_recentes: [],
};

describe('Actions (API test)', () => {
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const compteurActionsRepository = new CompteurActionsRepository(
    TestUtil.prisma,
  );
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const fAQRepository = new FAQRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const quizzRepository = new QuizzRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const tagRepository = new TagRepository(TestUtil.prisma);
  let blockTextRepository = new BlockTextRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await actionRepository.loadCache();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it(`GET /compteur_actions - total des actions faites`, async () => {
    // GIVEN
    await TestUtil.create(DB.compteurActions, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      faites: 45,
      vues: 154,
    });
    await TestUtil.create(DB.compteurActions, {
      code: '456',
      type: TypeAction.classique,
      type_code_id: 'classique_456',
      faites: 10,
      vues: 0,
    });

    // WHEN
    const response = await TestUtil.GET('/compteur_actions');

    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toEqual({ nombre_total_actions_faites: 55 });
  });

  it(`GET /utilisateurs/id/actions/id - detail standard d'une action utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '123' },
          vue_le: null,
          faite_le: new Date(1),
          feedback: null,
          like_level: 2,
          liste_questions: [],
          liste_partages: [],
        },
      ],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      label_compteur: '{NBR_ACTIONS} haha',
      besoins: ['composter'],
      pourquoi: 'haha {block_123}',
      sources: [{ url: 'haha', label: 'hoho' }],
      articles_ids: ['1'],
    });
    await TestUtil.create(DB.compteurActions, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      faites: 45,
      vues: 154,
    });
    await TestUtil.create(DB.article, { content_id: '1', image_url: 'a' });

    await actionRepository.onApplicationBootstrap();
    await compteurActionsRepository.loadCache();
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    delete response.body.explications_recommandation_raw;

    expect(response.body).toEqual({
      aides: [],
      besoins: ['composter'],
      code: '123',
      comment: 'Astuces',
      consigne: 'consigne',
      articles: [
        {
          content_id: '1',
          image_url: 'a',
          soustitre: 'Sous titre de mon article',
          thematique_principale: 'logement',
          thematiques: ['logement'],
          titre: 'Titre de mon article',
        },
      ],
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      deja_faite: true,
      deja_vue: false,
      like_level: 2,
      faqs: [],
      kycs: [],
      label_compteur: '45 haha',
      nom_commune: 'Dijon',
      nombre_aides_disponibles: 0,
      pourquoi: 'haha the texte',
      quizz_felicitations: 'bien',
      quizzes: [],
      services: [
        {
          categorie: 'dinde_volaille',
          recherche_service_id: 'recettes',
          sous_categorie: 'sans_cuisson',
        },
        {
          categorie: 'zero_dechet',
          recherche_service_id: 'proximite',
        },
        {
          categorie: 'emprunter',
          recherche_service_id: 'longue_vie_objets',
        },
      ],
      sous_titre: 'Sous titre',
      thematique: 'consommation',
      titre: '**The titre**',
      emoji: '🔥',
      type: 'classique',
      points: 100,
      sources: [
        {
          label: 'hoho',
          url: 'haha',
        },
      ],
      explications_recommandation: {
        est_exclu: false,
        liste_explications: [],
      },
      score_recommandation: 0.00481617146,
    });
  });

  it(`GET /utilisateurs/id/actions/id - explication reco`, async () => {
    // GIVEN
    const recommandation: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [Tag_v2.a_un_jardin],
      version: 0,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      recommandation: recommandation as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      label_compteur: '{NBR_ACTIONS} haha',
      besoins: ['composter'],
      pourquoi: 'haha {block_123}',
      sources: [{ url: 'haha', label: 'hoho' }],
      articles_ids: ['1'],
      tags_a_inclure_v2: [Tag_v2.a_un_jardin],
    });

    await actionRepository.onApplicationBootstrap();
    await tagRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body.explications_recommandation).toEqual({
      est_exclu: false,
      liste_explications: [{ tag: 'a_un_jardin' }],
    });
  });

  it(`GET /utilisateurs/id/actions/id - accorche une aide qui match le code insee de commune de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '123',
      besoins: ['composter'],
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.Département,
      codes_departement: ['21'],
      codes_postaux: [],
    });

    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(2);
    expect(action.nom_commune).toEqual('Dijon');
  });

  it(`GET /utilisateurs/id/actions/id - accorche une aide qui match le code insee de commune avec arrondissement de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      logement: { code_commune: '75101' } as any,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      besoins: ['composter'],
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.Commune,
      codes_commune_from_partenaire: ['75056'],
    });

    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(1);
    expect(action.nom_commune).toEqual('Paris');
  });

  it(`GET /utilisateurs/id/actions/id - accorche les faqs`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '123',
      faq_ids: ['456'],
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });
    await TestUtil.create(DB.fAQ, { id_cms: '456' });

    await fAQRepository.loadCache();
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;
    expect(action.faqs).toEqual([
      {
        question: 'question',
        reponse: 'reponse',
      },
    ]);
  });

  it(`GET /utilisateurs/id/actions/id - consultation track une action comme vue`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });

    await actionRepository.loadCache();

    // THEN
    const userDB_before = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.thematique_history],
    );

    expect(
      userDB_before.thematique_history.isActionVue({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(false);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.deja_vue).toEqual(false);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.thematique_history,
    ]);

    expect(
      userDB.thematique_history.isActionVue({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(true);

    // WHEN
    const response_2 = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/classique/123',
    );

    // THEN
    expect(response_2.status).toBe(200);
    expect(response_2.body.deja_vue).toEqual(true);
  });

  it(`GET /utilisateurs/id/actions/id - action de type simulateur doit contenir une liste de KYCs (quelles soient répondues ou non)`, async () => {
    // GIVEN
    const KYC2 = {
      id_cms: 1,
      code: KYCID.KYC_transport_type_utilisateur,
      question: 'Quel est votre moyen de transport principal ?',
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.test,
      points: 0,
      is_ngc: false,
      tags: [],
      thematique: Thematique.transport,
      conditions: [],
    };
    await TestUtil.create(DB.kYC, KYC2);
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID.KYC_transport_voiture_occasion,
      question: "Votre voiture est-elle d'occasion ?",
    });

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],
      answered_questions: [
        {
          ...KYC2,
          is_NGC: false,
          last_update: undefined,
          reponse_complexe: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      kyc: kyc as any,
    });
    const type_code_id = `${TypeAction.simulateur}_${ActionSimulateurID.action_simulateur_voiture}`;
    await TestUtil.create(DB.action, {
      code: ActionSimulateurID.action_simulateur_voiture,
      type: TypeAction.simulateur,
      type_code_id,
    });
    await kycRepository.loadCache();
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      `/utilisateurs/utilisateur-id/actions/simulateur/${ActionSimulateurID.action_simulateur_voiture}`,
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.kycs).toHaveLength(2);
    expect(response.body.enchainement_id).toEqual(type_code_id);
  });

  it(`GET /utilisateurs/id/actions/id - action de type bilan doit contenir une liste de KYCs (quelles soient répondues ou non)`, async () => {
    // GIVEN
    const KYC2 = {
      id_cms: 502,
      code: KYCID.KYC_type_logement,
      type: TypeReponseQuestionKYC.entier,
      question: 'Quel est le type de votre logement ?',
      categorie: Categorie.test,
      points: 0,
      is_ngc: false,
      tags: [],
      thematique: Thematique.logement,
      conditions: [],
    };
    await TestUtil.create(DB.kYC, KYC2 as any);
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],
      answered_questions: [
        {
          ...KYC2,
          is_NGC: false,
          last_update: undefined,
          reponse_complexe: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      kyc: kyc as any,
    });
    const type_code_id = `${TypeAction.bilan}_${ActionBilanID.action_bilan_logement}`;
    await TestUtil.create(DB.action, {
      code: ActionBilanID.action_bilan_logement,
      type: TypeAction.bilan,
      type_code_id,
    });
    await kycRepository.loadCache();
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      `/utilisateurs/utilisateur-id/actions/bilan/${ActionBilanID.action_bilan_logement}`,
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.kycs).toHaveLength(4);
    expect(response.body.enchainement_id).toEqual(type_code_id);
  });

  it(`GET /utilisateurs/id/actions/id - accroche les quizz liés à l'action`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['456'],
      type: TypeAction.quizz,
      type_code_id: 'quizz_123',
    });
    await TestUtil.create(DB.quizz, {
      content_id: '456',
      article_id: '1',
      questions: {
        liste_questions: [
          {
            libelle: "Qu'est-ce qu'un embout mousseur ?",
            reponses: [
              {
                reponse: "Un composant d'une bombe de crème chantilly",
                est_bonne_reponse: false,
              },
              {
                reponse: "Un élément d'une tireuse à bière",
                est_bonne_reponse: false,
              },
              {
                reponse: "Un dispositif réduisant le débit d'eau du robinet",
                est_bonne_reponse: true,
              },
            ],
            explication_ko: 'ko',
            explication_ok: 'ok',
          },
        ],
      },
      titre: 'titreA',
      soustitre: 'sousTitre',
      source: 'ADEME',
      image_url: 'https://',
      partenaire_id: undefined,
      tags_utilisateur: [],
      rubrique_ids: ['3', '4'],
      rubrique_labels: ['r3', 'r4'],
      codes_postaux: [],
      duree: 'pas long',
      frequence: 'souvent',
      difficulty: 1,
      points: 10,
      thematique_principale: Thematique.climat,
      thematiques: [Thematique.climat, Thematique.logement],
      created_at: undefined,
      updated_at: undefined,
      categorie: Categorie.recommandation,
      mois: [],
    });

    await quizzRepository.loadCache();
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/quizz/123',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.quizzes).toHaveLength(1);
    expect(action.quizzes[0]).toEqual({
      article_id: '1',
      content_id: '456',
      difficulty: 1,
      duree: 'pas long',
      points: 10,
      questions: [
        {
          explicationKO: 'ko',
          explicationOk: 'ok',
          libelle: "Qu'est-ce qu'un embout mousseur ?",
          reponses: [
            {
              exact: false,
              reponse: "Un composant d'une bombe de crème chantilly",
            },
            {
              exact: false,
              reponse: "Un élément d'une tireuse à bière",
            },
            {
              exact: true,
              reponse: "Un dispositif réduisant le débit d'eau du robinet",
            },
          ],
        },
      ],
      sousTitre: 'sousTitre',
      thematique_principale: 'climat',
      titre: 'titreA',
    });
  });

  it(`GET /utilisateurs/id/actions/id/score - calcul le score d'une action quizz`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3'],
      type: TypeAction.quizz,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions/quizz/123/score',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nombre_bonnes_reponses: 2,
      nombre_quizz_done: 3,
    });
  });

  it(`GET /utilisateurs/id/actions/id/faite - gagne les points sur quizz si 4 réponses sur 6`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });
    await TestUtil.create(DB.quizz, { content_id: '4' });
    await TestUtil.create(DB.quizz, { content_id: '5' });
    await TestUtil.create(DB.quizz, { content_id: '6' });

    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      badges: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '4', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '5', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '6', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
      gamification: gamification as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3', '4', '5', '6'],
      type: TypeAction.quizz,
      type_code_id: 'quizz_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/quizz/123/faite',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.points_classement).toEqual(20);
    expect(userDB.gamification.getPoints()).toEqual(20);
  });

  it(`GET /utilisateurs/id/actions/id/faite - gagne PAS les points sur quizz si 3 réponses sur 6`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });
    await TestUtil.create(DB.quizz, { content_id: '4' });
    await TestUtil.create(DB.quizz, { content_id: '5' });
    await TestUtil.create(DB.quizz, { content_id: '6' });
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      badges: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '4', attempts: [{ date: new Date(), score: 0 }] },
          { content_id: '5', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '6', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
      gamification: gamification as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3', '4', '5', '6'],
      type: TypeAction.quizz,
      type_code_id: 'quizz_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/quizz/123/faite',
    );

    // THEN
    expect(response.status).toBe(400);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.points_classement).toEqual(0);
    expect(userDB.gamification.getPoints()).toEqual(0);
  });

  it(`GET /utilisateurs/id/actions/id/faite - pas terminable si pas toutes les réponses`, async () => {
    // GIVEN
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.quizz, { content_id: '2' });
    await TestUtil.create(DB.quizz, { content_id: '3' });
    await TestUtil.create(DB.quizz, { content_id: '4' });
    await TestUtil.create(DB.quizz, { content_id: '5' });
    await TestUtil.create(DB.quizz, { content_id: '6' });
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      badges: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '3', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '4', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '5', attempts: [{ date: new Date(), score: 100 }] },
        ],
      } as any,
      gamification: gamification as any,
    });

    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['1', '2', '3', '4', '5', '6'],
      type: TypeAction.quizz,
      type_code_id: 'quizz_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/quizz/123/faite',
    );

    // THEN
    expect(response.status).toBe(400);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.points_classement).toEqual(0);
    expect(userDB.gamification.getPoints()).toEqual(0);
  });

  it(`POST /utilisateurs/id/actions/id/faite - indique que l'action est faite`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [],
      liste_thematiques: [],
    };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      badges: [],
      popup_reset_vue: false,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
      gamification: gamification as any,
      points_classement: 0,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });

    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/faite',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      userDB.thematique_history.isActionFaite({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(true);
    expect(userDB.points_classement).toEqual(100);
    expect(userDB.gamification.getPoints()).toEqual(100);

    const compteur = await TestUtil.prisma.compteurActions.findMany();

    expect(compteur.length).toEqual(1);
    expect(compteur[0].faites).toEqual(1);
    expect(compteur[0].type_code_id).toEqual('classique_123');
  });

  it(`POST /utilisateurs/id/actions/id/faite - faire 2 fois ne raporte qu'une fois des point`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [],
      liste_thematiques: [],
    };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      badges: [],
      popup_reset_vue: false,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
      gamification: gamification as any,
      points_classement: 0,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });

    await actionRepository.loadCache();

    // WHEN
    await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/faite',
    );
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/faite',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      userDB.thematique_history.isActionFaite({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(true);
    expect(userDB.points_classement).toEqual(100);
    expect(userDB.gamification.getPoints()).toEqual(100);

    const compteur = await TestUtil.prisma.compteurActions.findMany();

    expect(compteur.length).toEqual(1);
    expect(compteur[0].faites).toEqual(1);
    expect(compteur[0].type_code_id).toEqual('classique_123');
  });

  it(`POST /utilisateurs/id/actions/id/feedback - pousse un feedback pour une action deja vue`, async () => {
    // GIVEN
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
          liste_questions: [],
          liste_partages: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/feedback',
    ).send({
      like_level: 2,
      feedback: 'pas si mal',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u).toEqual({
      action: {
        code: '123',
        type: 'classique',
      },
      faite_le: new Date(1),
      feedback: 'pas si mal',
      like_level: 2,
      vue_le: null,
      liste_questions: [],
      liste_partages: [],
    });
  });

  it(`POST /utilisateurs/id/actions/id/share déclare un partage de l'action déjà faite`, async () => {
    // GIVEN
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
          liste_questions: [],
          liste_partages: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/share',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u.liste_partages).toHaveLength(1);
    expect(action_u.liste_partages[0].getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });

  it(`POST /utilisateurs/id/actions/id/share déclare un partage de l'action jamais croisée`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/share',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u.liste_partages).toHaveLength(1);
    expect(action_u.liste_partages[0].getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });

  it(`POST /utilisateurs/id/actions/id/feedback - pousse une question pour une action deja faite`, async () => {
    // GIVEN
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
          liste_questions: [],
          liste_partages: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/question',
    ).send({
      question: 'Pour de vrai, comment faire ?',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u.liste_questions).toHaveLength(1);
    expect(action_u.liste_questions[0].date.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
    expect(action_u.liste_questions[0].est_action_faite).toEqual(true);
    expect(action_u.liste_questions[0].question).toEqual(
      'Pour de vrai, comment faire ?',
    );
  });

  it(`POST /utilisateurs/id/actions/id/feedback - pousse une question pour une action pas encore faite`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/question',
    ).send({
      question: 'Pour de vrai, comment faire ?',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u.liste_questions).toHaveLength(1);
    expect(action_u.liste_questions[0].date.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
    expect(action_u.liste_questions[0].est_action_faite).toEqual(false);
    expect(action_u.liste_questions[0].question).toEqual(
      'Pour de vrai, comment faire ?',
    );
  });

  it(`POST /utilisateurs/id/actions/id/feedback - pousse un feedback pour une action jamais vue`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/feedback',
    ).send({
      like_level: 2,
      feedback: 'pas si mal',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u).toEqual({
      action: {
        code: '123',
        type: 'classique',
      },
      faite_le: null,
      feedback: 'pas si mal',
      like_level: 2,
      vue_le: null,
      liste_questions: [],
      liste_partages: [],
    });
  });
  it(`POST /utilisateurs/id/actions/id/feedback - like level optionnel`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/feedback',
    ).send({
      feedback: 'pas si mal',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u).toEqual({
      action: {
        code: '123',
        type: 'classique',
      },
      faite_le: null,
      feedback: 'pas si mal',
      like_level: null,
      vue_le: null,
      liste_questions: [],
      liste_partages: [],
    });
  });

  it(`POST /utilisateurs/id/actions/id/feedback - feedback optionnel`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [],
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/feedback',
    ).send({
      like_level: 3,
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const action_u = userDB.thematique_history.findAction({
      type: TypeAction.classique,
      code: '123',
    });
    expect(action_u).toEqual({
      action: {
        code: '123',
        type: 'classique',
      },
      faite_le: null,
      feedback: null,
      like_level: 3,
      vue_le: null,
      liste_questions: [],
      liste_partages: [],
    });
  });

  it(`POST /utilisateurs/id/actions/id/feedback - erreur si mauvais like level`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/feedback',
    ).send({
      like_level: 5.4,
      feedback: 'pas si mal',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Les niveaux de like autorisés sont 1 - 2 - 3 - 4 , ou null, reçu [5.4]',
    );
  });
  it(`POST /utilisateurs/id/actions/id/feedback - erreur feedback trop long`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/feedback',
    ).send({
      feedback:
        '#########################################################################################################' +
        '#########################################################################################################' +
        '#########################################################################################################' +
        '#########################################################################################################' +
        '#########################################################################################################',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `L'attribut [feedback] doit être de longueur maximale 500, longueur reçue : 525`,
    );
  });
  it(`POST /utilisateurs/id/actions/id/feedback - erreur feedback avec caracteres spéciaux`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });
    await actionRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/actions/classique/123/feedback',
    ).send({
      feedback: 'ce ci est du code index++ ${}',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `le texte ne peut pas contenir de caractères spéciaux comme [^#&*<>/{|}$%@+]`,
    );
  });

  it(`DELETE /utilisateurs/id/actions/XXX supprime une action `, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      recommandations_winter: [],
      codes_actions_exclues: [],

      liste_thematiques: [],
    };
    const reco: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [],
      version: 0,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
      recommandation: reco as any,
    });
    for (let index = 1; index <= 10; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/actions/classique/3',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user.thematique_history.getAllActionsExclues()).toHaveLength(1);
    expect(
      user.thematique_history.getActionsExcluesEtDates()[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
    expect(user.thematique_history.getAllTypeCodeActionsExclues()[0]).toEqual({
      type: TypeAction.classique,
      code: '3',
    });
  });

  it(`DELETE /utilisateurs/id/actions/XXX supprime 6 action `, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      recommandations_winter: [],
      codes_actions_exclues: [],

      liste_thematiques: [],
    };
    const reco: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [],
      version: 0,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
      recommandation: reco as any,
    });
    for (let index = 1; index <= 10; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/actions/first_block_of_six',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user.thematique_history.getAllActionsExclues()).toHaveLength(6);
    expect(
      user.thematique_history.getActionsExcluesEtDates()[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
    expect(user.thematique_history.getAllTypeCodeActionsExclues()[0]).toEqual({
      type: TypeAction.classique,
      code: '3',
    });
  });
});
