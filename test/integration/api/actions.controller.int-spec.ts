import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionAPI } from '../../../src/infrastructure/api/types/actions/ActionAPI';
import { ActionLightAPI } from '../../../src/infrastructure/api/types/actions/ActionLightAPI';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Actions (API test)', () => {
  const actionRepository = new ActionRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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
    expect(action.nombre_aides_disponibles).toEqual(0);
  });
  it(`GET /actions - liste le catalogue d'action : accroche nbre aide si code insee`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions?code_commune=21231');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const action: ActionLightAPI = response.body[0];

    expect(action.nombre_aides_disponibles).toEqual(1);
  });

  it(`GET /utilisateurs/id/actions - liste le catalogue d'action`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/actions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const action: ActionLightAPI = response.body[0];

    expect(action.nombre_aides_disponibles).toEqual(1);
  });

  it(`GET /actions/type/id - consulte le détail d'une action`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/code_fonct');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.besoins).toEqual([]);
    expect(action.code).toEqual('code_fonct');
    expect(action.comment).toEqual('Astuces');
    expect(action.pourquoi).toEqual('En quelques mots');
    expect(action.titre).toEqual('The titre');
    expect(action.sous_titre).toEqual('Sous titre');
    expect(action.quizz_felicitations).toEqual('bien');
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
    expect(action.nom_commune).toBeUndefined();
  });

  it(`GET /actions/id - accorche les aides par le besoin - seulement nationales si pas de code insee de commune en argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: Echelle.National,
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.National,
    });

    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadPartenaires();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

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
      echelle: Echelle.National,
      date_expiration: new Date(1),
    });

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

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
      echelle: Echelle.Département,
    });

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

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
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Département,
      codes_departement: ['21'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/actions/classique/123?code_commune=21231',
    );

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(2);
    expect(action.nom_commune).toEqual('Dijon');
  });

  it(`GET /utilisateurs/id/actions/id - accorche une aide qui match le code insee de commune de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: Echelle.Département,
      codes_departement: ['21'],
      codes_postaux: [],
    });

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

  it(`GET /utilisateurs/id/actions/id - consultation track une action comme vue`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, { code: '123' });

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

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.thematique_history,
    ]);

    expect(
      userDB.thematique_history.isActionVue({
        type: TypeAction.classique,
        code: '123',
      }),
    ).toEqual(true);
  });

  it(`GET /utilisateurs/id/actions/id - accroche les quizz liés à l'action`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });
    await TestUtil.create(DB.action, {
      code: '123',
      quizz_ids: ['456'],
      type: TypeAction.quizz,
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
      code_commune: '21231',
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
    expect(response.body).toEqual({ score: 67 });
  });

  it(`GET /actions/id - pas d'aide expirée locale`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaire_id: '123',
      echelle: Echelle.Commune,
      codes_postaux: ['21000'],
      date_expiration: new Date(1),
    });

    // WHEN
    const response = await TestUtil.GET(
      '/actions/classique/123?code_commune=21231',
    );

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
    const response = await TestUtil.GET('/actions/classique/bad_code');

    // THEN
    expect(response.status).toBe(404);
  });
  it(`GET /actions/id - 400 si type d'actions inconnu`, async () => {
    // GIVEN
    await TestUtil.create(DB.action);

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET('/actions/truc/code_fonct');

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(`Type d'action [truc] inconnu`);
  });

  it(`GET /actions - liste le catalogue d'action : 2 actions`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_code1',
      cms_id: '1',
      code: 'code1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_code2',
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
      type_code_id: 'classique_code1',
      cms_id: '1',
      code: 'code1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_code2',
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
      type_code_id: 'classique_code1',
      cms_id: '1',
      code: 'code1',
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      type_code_id: 'classique_code2',
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
