import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ActionLightAPI } from '../../../src/infrastructure/api/types/actions/ActionLightAPI';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { BlockTextRepository } from '../../../src/infrastructure/repository/blockText.repository';
import { CompteurActionsRepository } from '../../../src/infrastructure/repository/compteurActions.repository';
import { FAQRepository } from '../../../src/infrastructure/repository/faq.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Actions Catalogue Offline (API test)', () => {
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const compteurActionsRepository = new CompteurActionsRepository(
    TestUtil.prisma,
  );
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const fAQRepository = new FAQRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const quizzRepository = new QuizzRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
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
        liste_sous_thematiques: [],
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
        liste_sous_thematiques: [],
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
});
