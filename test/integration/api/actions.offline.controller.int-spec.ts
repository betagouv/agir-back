import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ActionAPI } from '../../../src/infrastructure/api/types/actions/ActionAPI';
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

describe('Single Actions Offline (API test)', () => {
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

  it(`GET /actions/type/id - consulte le détail d'une action`, async () => {
    // GIVEN
    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();
    await TestUtil.create(DB.action, {
      code: 'code_fonct',
      type: TypeAction.classique,
      type_code_id: 'classique_code_fonct',
      label_compteur: '{NBR_ACTIONS} haha',
      pourquoi: 'en quelques mots {block_123}',
      sources: [{ url: 'haha', label: 'hoho' }],
    });
    await TestUtil.create(DB.compteurActions, {
      code: 'code_fonct',
      type: TypeAction.classique,
      type_code_id: 'classique_code_fonct',
      faites: 45,
      vues: 154,
    });
    await actionRepository.onApplicationBootstrap();
    await compteurActionsRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/code_fonct');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action).toEqual({
      aides: [],
      besoins: [],
      code: 'code_fonct',
      comment: 'Astuces',
      consigne: 'consigne',
      faqs: [],
      kycs: [],
      articles: [],
      label_compteur: '45 haha',
      nombre_actions_en_cours: 45,
      nombre_actions_faites: 45,
      nombre_aides_disponibles: 0,
      points: 100,
      pourquoi: 'en quelques mots the texte',
      quizz_felicitations: 'bien',
      quizzes: [],
      services: [
        {
          categorie: 'dinde_volaille',
          recherche_service_id: 'recettes',
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
      type: 'classique',
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
    });
  });

  it(`GET /actions/id - accorche les aides par le besoin - seulement nationales si pas de code insee de commune en argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.National,
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      besoin: 'composter',
      partenaires_supp_ids: ['123'],
      echelle: Echelle.National,
      est_gratuit: true,
    });

    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadCache();

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
        est_gratuit: true,
      },
    ]);
  });
  it(`GET /actions/id - pas d'aide nationnale expirée`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaires_supp_ids: ['123'],
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
      partenaires_supp_ids: ['123'],
      echelle: Echelle.Département,
    });

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.aides).toHaveLength(0);
  });
  it(`GET /actions/id - les éléments de FAQ`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', faq_ids: ['456'] });
    await TestUtil.create(DB.fAQ, { id_cms: '456' });

    await fAQRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

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
  it(`GET /actions/id - les articles miés`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', articles_ids: ['1', '2'] });
    await TestUtil.create(DB.article, { content_id: '1', image_url: 'a' });
    await TestUtil.create(DB.article, { content_id: '2', image_url: 'b' });
    await TestUtil.create(DB.article, { content_id: '3', image_url: 'c' });

    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/actions/classique/123');

    // THEN
    expect(response.status).toBe(200);

    const action: ActionAPI = response.body;

    expect(action.articles).toEqual([
      {
        content_id: '1',
        image_url: 'a',
        soustitre: 'Sous titre de mon article',
        thematique_principale: 'logement',
        thematiques: ['logement'],
        titre: 'Titre de mon article',
      },
      {
        content_id: '2',
        image_url: 'b',
        soustitre: 'Sous titre de mon article',
        thematique_principale: 'logement',
        thematiques: ['logement'],
        titre: 'Titre de mon article',
      },
    ]);
  });

  it(`GET /actions/id - accorche une aide qui match un code insee de commune`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
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

  it(`GET /actions/id - pas d'aide expirée locale`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, { code: '123', besoins: ['composter'] });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'chauffer',
      partenaires_supp_ids: ['123'],
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
