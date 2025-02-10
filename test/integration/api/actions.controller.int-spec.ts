import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { ActionAPI } from '../../../src/infrastructure/api/types/actions/ActionAPI';
import { CategorieRecherche } from '../../../src/domain/bibliotheque_services/recherche/categorieRecherche';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { ActionLightAPI } from '../../../src/infrastructure/api/types/actions/ActionLightAPI';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { EchelleAide } from '../../../src/domain/aides/echelle';

describe('Actions (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);

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
    expect(action.services).toHaveLength(2);
    expect(action.services).toContainEqual({
      categorie: 'dinde_volaille',
      recherche_service_id: 'recettes',
    });
    expect(action.services).toContainEqual({
      categorie: 'emprunter',
      recherche_service_id: 'longue_vie_objets',
    });
    expect(action.kycs).toEqual([]);
    expect(action.quizzes).toEqual([]);
    expect(action.nombre_actions_en_cours).toBeGreaterThanOrEqual(0);
    expect(action.nombre_aides_disponibles).toBeGreaterThanOrEqual(0);
  });

  it(`GET /actions/id - accorche les aides par le besoin - seulement nationales si pas de code insee de commune en argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: EchelleAide.National,
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: EchelleAide.National,
    });

    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadPartenaires();

    // WHEN
    const response = await TestUtil.GET('/actions/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.besoins).toEqual(['composter']);
    expect(action.aides).toEqual([
      {
        content_id: '2',
        echelle: 'National',
        montant_max: 999,
        partenaire_logo_url: 'logo_url',
        partenaire_nom: 'ADEME',
        partenaire_url: 'https://ademe.fr',
        titre: 'titreA',
      },
    ]);
  });
  it(`GET /actions/id - pas d'aide nationnale expirée`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: EchelleAide.National,
      date_expiration: new Date(1),
    });

    // WHEN
    const response = await TestUtil.GET('/actions/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(0);
  });

  it(`GET /actions/id - accroche les aides par le besoin - pas d'aide non nationales si pas de code insee de commune en argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: EchelleAide.Département,
    });

    // WHEN
    const response = await TestUtil.GET('/actions/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(0);
  });

  it(`GET /actions/id - accorche une aide qui match un code insee de commune`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: EchelleAide.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'manger',
      partenaire_id: '123',
      echelle: EchelleAide.Département,
      codes_departement: ['21'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET('/actions/123?code_commune=21231');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(2);
  });
  it(`GET /actions/id - pas d'aide expirée locale`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: EchelleAide.Commune,
      codes_postaux: ['21000'],
      date_expiration: new Date(1),
    });

    // WHEN
    const response = await TestUtil.GET('/actions/123?code_commune=21231');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(0);
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
