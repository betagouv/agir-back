import {
  Consultation,
  Realisation,
} from '../../../src/domain/actions/catalogueAction';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ProfileRecommandationUtilisateur_v0 } from '../../../src/domain/object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Tag_v2 } from '../../../src/domain/scoring/system_v2/Tag_v2';
import { SousThematique } from '../../../src/domain/thematique/sousThematique';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ActionLightAPI } from '../../../src/infrastructure/api/types/actions/ActionLightAPI';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { CompteurActionsRepository } from '../../../src/infrastructure/repository/compteurActions.repository';
import { TagRepository } from '../../../src/infrastructure/repository/tag.repository';
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
  prm: undefined,
};

describe('Actions Catalogue Utilisateur (API test)', () => {
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const tagRepository = new TagRepository(TestUtil.prisma);
  const compteurActionsRepository = new CompteurActionsRepository(
    TestUtil.prisma,
  );

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

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur`, async () => {
    // GIVEN
    logement.code_commune = '21231';

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.compteurActions, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
      faites: 45,
      vues: 154,
    });
    await compteurActionsRepository.loadCache();

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    delete action.explications_recommandation_raw;

    expect(action).toEqual({
      code: '123',
      deja_faite: false,
      deja_vue: false,
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      nombre_aides_disponibles: 1,
      sous_titre: 'Sous titre',
      thematique: 'consommation',
      titre: '**The titre**',
      emoji: '🔥',
      type: 'classique',
      points: 100,
      explications_recommandation: {
        est_exclu: false,
        liste_explications: [],
      },
      label_compteur: 'label_compteur',
      montant_max_economies_euros: 0,
    });

    expect(response.body.nombre_resultats).toEqual(1);
    expect(response.body.nombre_resultats_disponibles).toEqual(1);
  });

  it(`GET /utilisateurs/id/actions - montant euros pour actions winter`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    const thema: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      liste_actions_utilisateur: [],
      liste_thematiques: [],
      recommandations_winter: [
        {
          action: {
            code: '123',
            type: TypeAction.classique,
          },
          montant_economies_euros: 12,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      thematique_history: thema as any,
      logement: logement as any,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      type: TypeAction.classique,
      type_code_id: 'classique_123',
    });
    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    delete action.explications_recommandation_raw;

    expect(action.montant_max_economies_euros).toEqual(12);
  });

  it(`GET /utilisateurs/id/actions - action pas visible en PROD`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_1',
      code: '1',
      cms_id: '1',
      thematique: Thematique.alimentation,
      VISIBLE_PROD: true,
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_2',
      code: '2',
      cms_id: '2',
      thematique: Thematique.alimentation,
      VISIBLE_PROD: false,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
  });
  it(`GET /utilisateurs/id/actions - action visible en DEV`, async () => {
    // GIVEN
    logement.code_commune = '21231';

    process.env.IS_PROD = 'false';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_1',
      code: '1',
      cms_id: '1',
      thematique: Thematique.alimentation,
      VISIBLE_PROD: true,
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_2',
      code: '2',
      cms_id: '2',
      thematique: Thematique.alimentation,
      VISIBLE_PROD: false,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action  - skip/take absent`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
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
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(10);

    expect(response.body.nombre_resultats).toEqual(10);
    expect(response.body.nombre_resultats_disponibles).toEqual(10);
  });
  it(`GET /utilisateurs/id/actions - liste le catalogue d'action  - take`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
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
      '/utilisateurs/utilisateur-id/actions?take=5',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(5);

    expect(response.body.nombre_resultats).toEqual(5);
    expect(response.body.nombre_resultats_disponibles).toEqual(10);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action  - skip take`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
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
      '/utilisateurs/utilisateur-id/actions?take=5&skip=7',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(3);

    expect(response.body.nombre_resultats).toEqual(3);
    expect(response.body.nombre_resultats_disponibles).toEqual(10);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre thematique`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
    });
    await TestUtil.create(DB.action, {
      code: '3',
      cms_id: '3',
      type: TypeAction.classique,
      type_code_id: 'classique_3',
      thematique: Thematique.climat,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?thematique=alimentation&thematique=logement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);

    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: true,
        liste_sous_thematiques: [],
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'logement',
        label: 'logement',
        selected: true,
        liste_sous_thematiques: [
          {
            code: 'logement_economie_energie',
            label: "Faire des économies d'énergie",
            selected: false,
          },
          {
            code: 'logement_risque_naturel',
            label: 'Les risques naturels',
            selected: false,
          },
        ],
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
        liste_sous_thematiques: [],
      },
    ]);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre sous thematique`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.logement,
      sous_thematique: SousThematique.logement_economie_energie,
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      sous_thematique: SousThematique.logement_economie_energie,
    });
    await TestUtil.create(DB.action, {
      code: '3',
      cms_id: '3',
      type: TypeAction.classique,
      type_code_id: 'classique_3',
      thematique: Thematique.logement,
      sous_thematique: SousThematique.logement_risque_naturel,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?sous_thematique=logement_risque_naturel',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'logement',
        label: 'logement',
        selected: false,
        liste_sous_thematiques: [
          {
            code: 'logement_economie_energie',
            label: "Faire des économies d'énergie",
            selected: false,
          },
          {
            code: 'logement_risque_naturel',
            label: 'Les risques naturels',
            selected: true,
          },
        ],
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
        liste_sous_thematiques: [],
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
        liste_sous_thematiques: [],
      },
    ]);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre titre textuel`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre_recherche: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre_recherche: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?titre=belle',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
  });

  it(`GET /utilisateurs/id/actions - filtre consultation`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    const thematique_history: ThematiqueHistory_v0 = {
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
      ],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
    });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    let response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=vu',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
    expect(response.body.consultation).toEqual(Consultation.vu);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=pas_vu',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('2');
    expect(response.body.consultation).toEqual(Consultation.pas_vu);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=tout',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.consultation).toEqual(Consultation.tout);

    // WHEN
    response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.consultation).toEqual(Consultation.tout);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?consultation=blablabla',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Type de consultation [blablabla] inconnu',
    );
  });

  it(`GET /utilisateurs/id/actions - filtre realisation`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
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
      logement: logement as any,
      thematique_history: thematique_history as any,
    });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    let response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?realisation=faite',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
    expect(response.body.realisation).toEqual(Realisation.faite);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?realisation=pas_faite',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('2');
    expect(response.body.realisation).toEqual(Realisation.pas_faite);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?realisation=tout',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.realisation).toEqual(Realisation.tout);

    // WHEN
    response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.consultation).toEqual(Consultation.tout);
    expect(response.body.realisation).toEqual(Realisation.tout);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?realisation=blablabla',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Type de realisation [blablabla] inconnu',
    );
  });

  it(`GET /utilisateurs/id/actions - filtre realisation+consultation`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '1' },
          faite_le: new Date(),
          vue_le: new Date(),
          feedback: null,
          like_level: null,
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
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    let response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?realisation=faite&consultation=vu',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
    expect(response.body.realisation).toEqual(Realisation.faite);
    expect(response.body.consultation).toEqual(Consultation.vu);
  });

  it(`GET /utilisateurs/id/actions - boolean action deja vue / deja faite`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { type: TypeAction.classique, code: '123' },
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
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
    });

    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.deja_vue).toEqual(true);
    expect(action.deja_faite).toEqual(true);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre ordre recommanddée`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    const reco: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [Tag_v2.a_un_jardin],
      version: 0,
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      recommandation: reco as any,
    });

    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre_recherche: 'Une belle action',
      tags_a_inclure_v2: [Tag_v2.a_un_jardin],
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre_recherche: 'Une action toute nulle',
      tags_a_exclure_v2: [Tag_v2.a_un_jardin],
    });
    await TestUtil.create(DB.action, {
      code: '3',
      cms_id: '3',
      type: TypeAction.classique,
      type_code_id: 'classique_3',
      thematique: Thematique.transport,
      titre_recherche: 'Une action toute nulle',
    });
    await actionRepository.onApplicationBootstrap();
    await TestUtil.create(DB.tag, {
      id_cms: '1',
      tag: Tag_v2.a_un_jardin,
      label_explication: `jardin`,
    });
    await tagRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?ordre=recommandee',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.actions[0].code).toEqual('1');
    expect(response.body.actions[1].code).toEqual('3');
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre ordre recommandée perso, qui exclue celle exclues`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    const reco: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [],
      version: 0,
    };

    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [
        {
          action: { code: '1', type: TypeAction.classique },
          date: new Date(1),
        },
      ],
      liste_actions_utilisateur: [],
      recommandations_winter: [],
      liste_thematiques: [
        {
          first_personnalisation_date: null,
          personnalisation_done_once: false,
          thematique: Thematique.alimentation,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      recommandation: reco as any,
      thematique_history: thematique_history as any,
    });

    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre_recherche: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre_recherche: 'Une action toute nulle',
    });
    await TestUtil.create(DB.action, {
      code: '3',
      cms_id: '3',
      type: TypeAction.classique,
      type_code_id: 'classique_3',
      thematique: Thematique.transport,
      titre_recherche: 'Une action toute nulle',
    });
    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?ordre=recommandee_filtre_perso',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.actions[0].code).toEqual('2');
    expect(response.body.actions[1].code).toEqual('3');
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action pour un utilisateur - filtre titre textuel`, async () => {
    // GIVEN
    logement.code_commune = '21231';
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre_recherche: 'Une belle action',
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      titre_recherche: 'Une action toute nulle',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/actions?titre=belle',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.actions[0].code).toEqual('1');
  });
});
