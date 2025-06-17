import { KYC } from '@prisma/client';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  BooleanKYC,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/QuestionKYCData';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ProfileRecommandationUtilisateur_v0 } from '../../../src/domain/object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Tag_v2 } from '../../../src/domain/scoring/system_v2/Tag_v2';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

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
  latitude: 48,
  longitude: 2,
  numero_rue: '12',
  rue: 'avenue de la Paix',
  code_commune: '21231',
  score_risques_adresse: undefined,
};

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
  tags: [TagUtilisateur.appetence_bouger_sante],
  thematique: Thematique.consommation,
  ngc_key: '123',
  short_question: 'short',
  image_url: 'AAA',
  conditions: [],
  unite: { abreviation: 'kg' },
  emoji: '🔥',
};

describe('Thematique (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - detail d'une thematique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      enchainement_questions_personnalisation:
        'ENCHAINEMENT_KYC_personnalisation_alimentation',
      est_personnalisation_necessaire: true,
      thematique: 'alimentation',
      liste_actions_recommandees: [],
      nom_commune: 'Dijon',
      nombre_actions: 0,
      nombre_aides: 0,
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
    });
  });
  it(`GET /utilisateurs/id/thematiques/alimentation - personnalisation done`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      enchainement_questions_personnalisation:
        'ENCHAINEMENT_KYC_personnalisation_alimentation',
      est_personnalisation_necessaire: false,
      thematique: 'alimentation',
      liste_actions_recommandees: [],
      nom_commune: 'Dijon',
      nombre_actions: 0,
      nombre_aides: 0,
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
    });
  });
  it(`POST /utilisateurs/id/thematiques/alimentation/personnaliation_ok - API set l'état de perso`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: false,
          first_personnalisation_date: null,
        },
      ],
    };
    const reco: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [],
      version: 0,
    };

    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      badges: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
      gamification: gamification as any,
      recommandation: reco as any,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/personnalisation_ok',
    );

    // THEN
    expect(response.status).toBe(201);

    const user_after = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user_after.thematique_history.isPersonnalisationDoneOnce(
        Thematique.alimentation,
      ),
    ).toEqual(true);
    expect(
      user_after.thematique_history
        .getDatePremierePersonnalisation(Thematique.alimentation)
        .getTime(),
    ).toBeGreaterThan(Date.now() - 200);
    expect(user_after.points_classement).toEqual(25);
    expect(user_after.gamification.getPoints()).toEqual(25);
  });
  it(`POST /utilisateurs/id/thematiques/alimentation/personnaliation_ok - API set l'état de perso compte pas les points si deja perso faite`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: false,
          first_personnalisation_date: null,
        },
      ],
    };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      popup_reset_vue: false,
      badges: [],
    };

    const reco: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [],
      version: 0,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
      gamification: gamification as any,
      recommandation: reco as any,
    });
    // WHEN
    await TestUtil.POST(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/personnalisation_ok',
    );
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/personnalisation_ok',
    );

    // THEN
    expect(response.status).toBe(201);

    const user_after = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user_after.points_classement).toEqual(25);
    expect(user_after.gamification.getPoints()).toEqual(25);
  });

  it(`POST /utilisateurs/id/thematiques/alimentation/personnaliation_ok - recalcul des tag d'exclusion`, async () => {
    // GIVEN
    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: KYCID.KYC_proprietaire,
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'Proprio ?',
      tags: [],
      thematique: Thematique.logement,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: undefined,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
    });
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC_proprietaire,
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            {
              label: 'proprio',
              code: BooleanKYC.oui,
              selected: true,
            },
            {
              label: 'pas proprio',
              code: BooleanKYC.non,
              selected: false,
            },
            {
              label: 'je sais pas',
              code: 'ne_sais_pas',
              selected: false,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
      logement: logement as any,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/personnalisation_ok',
    );

    // THEN
    expect(response.status).toBe(201);

    const user_after = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(user_after.recommandation.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_urbaine,
      Tag_v2.est_proprietaire,
    ]);
  });

  it(`POST /utilisateurs/id/thematiques/alimentation/reset_personnalisation -  reset l'état de perso`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_1',
      code: '1',
      cms_id: '1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_2',
      code: '2',
      cms_id: '2',
      thematique: Thematique.logement,
    });

    await actionRepository.onApplicationBootstrap();

    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [
        {
          action: { code: '1', type: TypeAction.classique },
          date: new Date(123),
        },
        {
          action: { code: '2', type: TypeAction.classique },
          date: new Date(456),
        },
      ],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [
            {
              action: { code: '1', type: TypeAction.classique },
              date: new Date(123),
            },
          ],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/reset_personnalisation',
    );

    // THEN
    expect(response.status).toBe(201);

    const user_after = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user_after.thematique_history.isPersonnalisationDoneOnce(
        Thematique.alimentation,
      ),
    ).toEqual(true);
    expect(user_after.thematique_history.getAllActionsExclues()).toEqual([
      {
        action: { code: '2', type: TypeAction.classique },
        date: new Date(456),
      },
    ]);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - detail d'une thematique avec liste d'action si perso done`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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
    await TestUtil.create(DB.action, {
      code: '123',
      besoins: ['composter'],
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(1);
    delete response.body.liste_actions_recommandees[0]
      .explications_recommandation_raw;

    expect(response.body.liste_actions_recommandees[0]).toEqual({
      code: '123',
      deja_faite: false,
      deja_vue: false,
      nombre_actions_en_cours: 0,
      nombre_actions_faites: 0,
      nombre_aides_disponibles: 1,
      points: 100,
      sous_titre: 'Sous titre',
      thematique: 'alimentation',
      titre: '**The titre**',
      type: 'classique',
      explications_recommandation: {
        est_exclu: false,
        liste_explications: [],
      },
    });
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - action flaguée déjà vue / faite OK`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      liste_actions_utilisateur: [
        {
          action: { code: '123', type: TypeAction.classique },
          vue_le: new Date(),
          faite_le: new Date(),
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
      ],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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
    await TestUtil.create(DB.action, {
      code: '123',
      besoins: ['composter'],
      thematique: Thematique.alimentation,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(1);
    expect(response.body.liste_actions_recommandees[0].code).toEqual('123');
    expect(response.body.liste_actions_recommandees[0].deja_vue).toEqual(true);
    expect(response.body.liste_actions_recommandees[0].deja_faite).toEqual(
      true,
    );
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - max 6 actions proposées`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(6);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - ne propose pas une action faite`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          faite_le: new Date(456),
          feedback: undefined,
          like_level: undefined,
          liste_partages: [],
          liste_questions: [],
          vue_le: new Date(123),
        },
      ],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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
    for (let index = 1; index <= 6; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(5);
    expect(
      response.body.liste_actions_recommandees.findIndex((a) => a.code === '1'),
    ).toEqual(-1);
    expect(
      response.body.liste_actions_recommandees.findIndex((a) => a.code === '2'),
    ).toBeGreaterThan(-1);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - exfiltre les actions no eligibles pour cause de tag excluant`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    const reco: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [Tag_v2.a_un_velo],
      version: 0,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
      recommandation: reco as any,
    });
    for (let index = 1; index <= 3; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_4',
      code: '4',
      cms_id: '4',
      thematique: Thematique.alimentation,
      tags_a_exclure_v2: [Tag_v2.a_un_velo],
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(3);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
  });
  it(`GET /utilisateurs/id/thematiques/alimentation - 3 actions si que 3 actions en base`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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
    for (let index = 1; index <= 3; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(3);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
  });

  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/3 supprime une action `, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/3',
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
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/first_block_of_six les 6 première recommandations`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
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
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/first_block_of_six',
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
  });
});
