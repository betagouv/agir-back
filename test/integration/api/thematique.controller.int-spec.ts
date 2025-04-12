import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  BooleanKYC,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/questionKYC';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { TagExcluant } from '../../../src/domain/scoring/tagExcluant';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
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
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });

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
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: false,
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

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
      gamification: gamification as any,
    });

    // THEN
    const user_before = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user_before.thematique_history.isPersonnalisationDone(
        Thematique.alimentation,
      ),
    ).toEqual(false);

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
      user_after.thematique_history.isPersonnalisationDone(
        Thematique.alimentation,
      ),
    ).toEqual(true);
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
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: false,
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

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
      gamification: gamification as any,
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
      code_commune: '21231',
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
    expect(user_after.thematique_history.getListeTagsExcluants()).toEqual([
      'est_proprietaire',
    ]);
  });

  it(`POST /utilisateurs/id/thematiques/alimentation/reset_personnalisation -  reset l'état de perso`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [
            {
              action: { code: '1', type: TypeAction.classique },
              date: new Date(123),
            },
          ],
          codes_actions_proposees: [{ code: '2', type: TypeAction.classique }],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
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
      user_after.thematique_history.isPersonnalisationDone(
        Thematique.alimentation,
      ),
    ).toEqual(false);
    expect(
      user_after.thematique_history.isPersonnalisationDoneOnce(
        Thematique.alimentation,
      ),
    ).toEqual(true);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - detail d'une thematique avec liste d'action si perso done`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
    });
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - action flaguée déjà vue / faite OK`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [
        {
          action: { code: '123', type: TypeAction.classique },
          vue_le: new Date(),
          faite_le: new Date(),
          feedback: null,
          like_level: null,
        },
      ],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
  it(`GET /utilisateurs/id/thematiques/alimentation - exfiltre les actions no eligibles pour cause de tag excluant`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [TagExcluant.a_un_velo],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
      tags_excluants: [TagExcluant.a_un_velo],
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
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '3' },
    ]);
  });
  it(`GET /utilisateurs/id/thematiques/alimentation - 3 actions si que 3 actions en base`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '3' },
    ]);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - ne propose que celles dans le bloc proposition`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '6' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
    expect(response.body.liste_actions_recommandees).toHaveLength(3);
    expect(response.body.liste_actions_recommandees[0].code).toEqual('1');
    expect(response.body.liste_actions_recommandees[1].code).toEqual('3');
    expect(response.body.liste_actions_recommandees[2].code).toEqual('6');
  });
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/1 supprime la seul action proposable`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [{ type: TypeAction.classique, code: '1' }],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/1',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toEqual([]);
  });
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/3 supprime une action à une position la remplace par une nouvelle`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '7' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
    expect(
      user.thematique_history.getActionsExclues(Thematique.alimentation),
    ).toHaveLength(1);
    expect(
      user.thematique_history
        .getActionsExcluesEtDates(Thematique.alimentation)[0]
        .date.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
    expect(
      user.thematique_history.getActionsExclues(Thematique.alimentation)[0],
    ).toEqual({ type: TypeAction.classique, code: '3' });
  });

  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/3 supprime une action à une position la remplace par une nouvelle, prends en compte les actions exclues`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [
            {
              action: { type: TypeAction.classique, code: '7' },
              date: new Date(1),
            },
            {
              action: { type: TypeAction.classique, code: '8' },
              date: new Date(2),
            },
            {
              action: { type: TypeAction.classique, code: '9' },
              date: new Date(3),
            },
          ],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '10' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
    expect(
      user.thematique_history.getActionsExclues(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '7' },
      { type: TypeAction.classique, code: '8' },
      { type: TypeAction.classique, code: '9' },
      { type: TypeAction.classique, code: '3' },
    ]);
  });

  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/3 supprime une action, shift car plus de nouvelles, partant de 5 actions dispo`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 5; index++) {
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

    let user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
    ]);
    expect(
      user.thematique_history.getActionsExclues(Thematique.alimentation),
    ).toStrictEqual([{ code: '3', type: TypeAction.classique }]);

    // WHEN
    const lecture = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(lecture.status).toBe(200);
    expect(lecture.body.liste_actions_recommandees).toHaveLength(4);
    expect(lecture.body.liste_actions_recommandees[0].code).toEqual('1');
    expect(lecture.body.liste_actions_recommandees[1].code).toEqual('2');
    expect(lecture.body.liste_actions_recommandees[2].code).toEqual('4');
    expect(lecture.body.liste_actions_recommandees[3].code).toEqual('5');
  });

  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/3 supprime une action, shift car plus de nouvelles`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/3',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
  });
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/7 supprime une action hors de la liste de propositions`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 7; index++) {
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
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/7',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '3' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
    expect(
      user.thematique_history.getActionsExclues(Thematique.alimentation),
    ).toStrictEqual([{ type: TypeAction.classique, code: '7' }]);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation : remplace une action manquante dans le CMS en décallant la liste et en piochant une nouvelle action`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 10; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    // WHEN
    await TestUtil.prisma.action.delete({
      where: {
        type_code_id: 'classique_' + 3,
      },
    });
    await actionRepository.onApplicationBootstrap();

    // THEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(6);
    expect(response.body.liste_actions_recommandees[0].code).toEqual('1');
    expect(response.body.liste_actions_recommandees[1].code).toEqual('2');
    expect(response.body.liste_actions_recommandees[2].code).toEqual('4');
    expect(response.body.liste_actions_recommandees[3].code).toEqual('5');
    expect(response.body.liste_actions_recommandees[4].code).toEqual('6');
    expect(response.body.liste_actions_recommandees[5].code).toEqual('7');

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
      { type: TypeAction.classique, code: '7' },
    ]);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation : remplace une action manquante dans le CMS en décallant la liste, place vide si plus d'actions`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_utilisateur: [],
      liste_tags_excluants: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 6; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    // WHEN
    await TestUtil.prisma.action.delete({
      where: {
        type_code_id: 'classique_' + 3,
      },
    });
    await actionRepository.onApplicationBootstrap();

    // THEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(5);
    expect(response.body.liste_actions_recommandees[0].code).toEqual('1');
    expect(response.body.liste_actions_recommandees[1].code).toEqual('2');
    expect(response.body.liste_actions_recommandees[2].code).toEqual('4');
    expect(response.body.liste_actions_recommandees[3].code).toEqual('5');
    expect(response.body.liste_actions_recommandees[4].code).toEqual('6');

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
  });
});
