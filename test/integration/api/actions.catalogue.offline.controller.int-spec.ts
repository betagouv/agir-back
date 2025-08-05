import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Selection } from '../../../src/domain/contenu/selection';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ActionLightAPI } from '../../../src/infrastructure/api/types/actions/ActionLightAPI';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { CompteurActionsRepository } from '../../../src/infrastructure/repository/compteurActions.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Actions Catalogue Offline (API test)', () => {
  const actionRepository = new ActionRepository(TestUtil.prisma);
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

  it(`GET /actions - liste le catalogue d'action sans filtre`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: false,
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
      },
      {
        code: 'logement',
        label: 'logement',
        selected: false,
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
      },
    ]);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.code).toEqual('code_fonct');
    expect(action.titre).toEqual('**The titre**');
    expect(action.sous_titre).toEqual('Sous titre');
    expect(action.thematique).toEqual(Thematique.consommation);
    expect(action.type).toEqual(TypeAction.classique);
    expect(action.nombre_actions_en_cours).toEqual(0);
    expect(action.nombre_aides_disponibles).toEqual(0);
  });
  it(`GET /actions - liste le catalogue d'action avec filtre thematique unique`, async () => {
    // GIVEN
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

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?thematique=alimentation');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.code).toEqual('1');
  });
  it(`GET /actions - liste le catalogue recherche texte titre`, async () => {
    // GIVEN
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
    const response = await TestUtil.GET('/actions?titre=tou');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.code).toEqual('2');
  });
  it(`GET /actions - liste le catalogue recherche texte titre malgré markdown`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
      titre: 'Une **belle** action',
      titre_recherche: 'Une belle action',
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?titre=belle action');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);
  });
  it(`GET /actions - liste le catalogue d'action avec filtre thematique multiple`, async () => {
    // GIVEN
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
      '/actions?thematique=alimentation&thematique=logement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);
    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: true,
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
      },
      {
        code: 'logement',
        label: 'logement',
        selected: true,
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
      },
    ]);
    expect(response.body.selections).toEqual([
      {
        code: 'actions_watt_watchers',
        label: 'actions_watt_watchers',
        selected: false,
      },
      { code: 'risques_naturels', label: 'risques_naturels', selected: false },
    ]);
  });

  it(`GET /actions - liste le catalogue d'action : données de base`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      code: 'code_fonct',
      besoins: ['composter'],
      label_compteur: '{NBR_ACTIONS} haha',
    });
    await TestUtil.create(DB.compteurActions, {
      code: 'code_fonct',
      type: TypeAction.classique,
      type_code_id: 'classique_code_fonct',
      faites: 45,
      vues: 154,
    });
    await compteurActionsRepository.loadCache();
    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?code_commune=21231');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    delete response.body.actions[0].explications_recommandation_raw;
    expect(response.body.actions[0]).toEqual({
      code: 'code_fonct',
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      nombre_aides_disponibles: 0,
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
      label_compteur: '45 haha',
      montant_max_economies_euros: 0,
      score_recommandation: 0,
    });
  });
  it(`GET /actions - liste le catalogue d'action : accroche nbre aide si code insee`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?code_commune=21231');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(1);

    const action: ActionLightAPI = response.body.actions[0];

    expect(action.nombre_aides_disponibles).toEqual(1);
  });

  it(`GET /actions - liste le catalogue d'action - filtre selections`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type: TypeAction.classique,
      type_code_id: 'classique_1',
      thematique: Thematique.logement,
      selections: [Selection.actions_watt_watchers],
    });
    await TestUtil.create(DB.action, {
      code: '2',
      cms_id: '2',
      type: TypeAction.classique,
      type_code_id: 'classique_2',
      thematique: Thematique.logement,
      selections: ['BB'],
    });
    await TestUtil.create(DB.action, {
      code: '3',
      cms_id: '3',
      type: TypeAction.classique,
      type_code_id: 'classique_3',
      thematique: Thematique.logement,
      selections: [Selection.actions_watt_watchers],
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/actions?selection=actions_watt_watchers',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.actions.length).toBe(2);

    expect(response.body.filtres).toEqual([
      {
        code: 'alimentation',
        label: 'alimentation',
        selected: false,
      },
      {
        code: 'transport',
        label: 'transport',
        selected: false,
      },
      {
        code: 'logement',
        label: 'logement',
        selected: false,
      },
      {
        code: 'consommation',
        label: 'consommation',
        selected: false,
      },
      {
        code: 'climat',
        label: 'climat',
        selected: false,
      },
      {
        code: 'dechet',
        label: 'dechet',
        selected: false,
      },
      {
        code: 'loisir',
        label: 'loisir',
        selected: false,
      },
    ]);
    expect(response.body.selections.length).toBeGreaterThan(1);
    expect(response.body.selections[0]).toEqual({
      code: 'actions_watt_watchers',
      label: 'actions_watt_watchers',
      selected: true,
    });
  });

  it(`GET /actions - liste le catalogue d'action - filtre avec une selection inconnue`, async () => {
    // WHEN
    const response = await TestUtil.GET('/actions?selection=unknown');

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Selection [unknown] inconnue');
  });
});
