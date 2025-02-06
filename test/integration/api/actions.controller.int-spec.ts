import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { ActionAPI } from '../../../src/infrastructure/api/types/actions/ActionAPI';
import { CategorieRecherche } from '../../../src/domain/bibliotheque_services/recherche/categorieRecherche';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { ActionLightAPI } from '../../../src/infrastructure/api/types/actions/ActionLightAPI';

describe('Actions (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await actionRepository.loadActions();
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
    expect(response.body.length).toBe(1);

    const action: ActionLightAPI = response.body[0];

    expect(action.code).toEqual('code_fonct');
    expect(action.titre).toEqual('The titre');
    expect(action.sous_titre).toEqual('Sous titre');
    expect(action.thematique).toEqual(Thematique.consommation);
    expect(action.type).toEqual(TypeAction.classique);
    expect(action.nombre_actions_en_cours).toBeGreaterThanOrEqual(0);
    expect(action.nombre_aides_disponibles).toBeGreaterThanOrEqual(0);
  });
  it(`GET /actions/id - consulte le détail d'une action`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions/code_fonct');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.besoins).toEqual([]);
    expect(action.code).toEqual('code_fonct');
    expect(action.comment).toEqual('Astuces');
    expect(action.pourquoi).toEqual('En quelques mots');
    expect(action.titre).toEqual('The titre');
    expect(action.sous_titre).toEqual('Sous titre');
    expect(action.thematique).toEqual(Thematique.consommation);
    expect(action.type).toEqual(TypeAction.classique);
    expect(action.lvo_action).toEqual(CategorieRecherche.emprunter);
    expect(action.lvo_objet).toEqual('chaussure');
    expect(action.recette_categorie).toEqual(CategorieRecherche.dinde_volaille);
    expect(action.kycs).toEqual([]);
    expect(action.quizzes).toEqual([]);
    expect(action.nombre_actions_en_cours).toBeGreaterThanOrEqual(0);
    expect(action.nombre_aides_disponibles).toBeGreaterThanOrEqual(0);
  });

  it(`GET /actions/id - 404 si action non trouvée`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions/bad_code');

    // THEN
    expect(response.status).toBe(404);
  });

  it(`GET /actions - liste le catalogue d'action : 2 actions`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      cms_id: '1',
      code: 'code1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      cms_id: '2',
      code: 'code2',
      thematique: Thematique.consommation,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
  it(`GET /actions - liste le catalogue d'action : filtre thematiques`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      cms_id: '1',
      code: 'code1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      cms_id: '2',
      code: 'code2',
      thematique: Thematique.consommation,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?thematique=alimentation');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    const action: ActionLightAPI = response.body[0];

    expect(action.code).toEqual('code1');
  });
  it(`GET /actions - liste le catalogue d'action : 400 si thematique inconnue`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      cms_id: '1',
      code: 'code1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      cms_id: '2',
      code: 'code2',
      thematique: Thematique.consommation,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?thematique=bad_thematique');

    // THEN
    expect(response.status).toBe(400);
  });
});
