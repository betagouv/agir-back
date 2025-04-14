import { Categorie } from '../../../src/domain/contenu/categorie';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { History_v0 } from '../../../src/domain/object_store/history/history_v0';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { BlockTextRepository } from '../../../src/infrastructure/repository/blockText.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/bibliotheque (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const quizzRepository = new QuizzRepository(TestUtil.prisma);
  let blockTextRepository = new BlockTextRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/bibliotheque - 403 if bad id', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { history: {} });
    await TestUtil.create(DB.article);
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/autre-id/bibliotheque');
    // THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateurs/id/bibliotheque - 200 et liste vide', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { history: {} });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(0);
  });
  it('GET /utilisateurs/id/bibliotheque - touche la stat de derniere activité', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { history: {} });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    await new Promise((f) => setTimeout(f, 100));
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(0);
    expect(userDB.derniere_activite.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
  it('GET /utilisateurs/id/bibliotheque - ne renvoie pas un article non lu', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { history: {} });
    await TestUtil.create(DB.article);
    await articleRepository.loadCache();
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(0);
  });
  it('GET /utilisateurs/id/bibliotheque - renvoie un article  lu', async () => {
    // GIVEN
    await thematiqueRepository.upsert({
      code: Thematique.alimentation,
      titre: 'Alimentation !!',
      id_cms: 1,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
    });
    await thematiqueRepository.upsert({
      code: Thematique.climat,
      titre: 'Climat !!',
      id_cms: 2,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
    });
    await thematiqueRepository.loadCache();
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            like_level: 2,
            read_date: new Date(123).toISOString(),
          },
        ],
      },
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      soustitre: 'sousTitre',
      thematique_principale: Thematique.climat,
      thematiques: [Thematique.climat, Thematique.logement],
      points: 10,
      image_url: 'https://',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(1);
    expect(response.body.contenu[0].content_id).toEqual('1');
    expect(response.body.contenu[0].type).toEqual('article');
    expect(response.body.contenu[0].titre).toEqual('titreA');
    expect(response.body.contenu[0].soustitre).toEqual('sousTitre');
    expect(response.body.contenu[0].thematique_principale).toEqual('climat');
    expect(response.body.contenu[0].thematique_principale_label).toEqual(
      'Climat !!',
    );
    expect(response.body.contenu[0].thematiques).toEqual([
      'climat',
      'logement',
    ]);
    expect(response.body.contenu[0].image_url).toEqual('https://');
    expect(response.body.contenu[0].points).toEqual(10);

    expect(response.body.filtres).toHaveLength(7);
    expect(response.body.filtres[0].code).toEqual('alimentation');
    expect(response.body.filtres[0].label).toEqual('Alimentation !!');
    expect(response.body.filtres[0].selected).toEqual(false);
    expect(response.body.filtres[1].selected).toEqual(false);
    expect(response.body.filtres[2].selected).toEqual(false);
    expect(response.body.filtres[3].selected).toEqual(false);
    expect(response.body.filtres[4].selected).toEqual(false);
    expect(response.body.filtres[5].selected).toEqual(false);
    expect(response.body.filtres[6].selected).toEqual(false);
  });
  it('GET /utilisateurs/id/bibliotheque - renvoie les articles de bonne thematique', async () => {
    // GIVEN
    await thematiqueRepository.upsert({
      code: Thematique.alimentation,
      titre: 'Alimentation !!',
      id_cms: 1,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
    });
    await thematiqueRepository.upsert({
      code: Thematique.climat,
      titre: 'Cliamt !!',
      id_cms: 2,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
    });
    await thematiqueRepository.upsert({
      code: Thematique.logement,
      titre: 'Logement !!',
      id_cms: 5,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
    });
    await thematiqueRepository.loadCache();
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            like_level: 2,
            read_date: new Date(123).toISOString(),
          },
          {
            content_id: '2',
            like_level: 2,
            read_date: new Date(123).toISOString(),
          },
          {
            content_id: '3',
            like_level: 2,
            read_date: new Date(123).toISOString(),
          },
        ],
      },
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      thematiques: [Thematique.alimentation],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      thematiques: [Thematique.alimentation, Thematique.logement],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      thematiques: [Thematique.logement],
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque?filtre_thematiques=logement',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
    expect(response.body.contenu[0].content_id).toEqual('2');
    expect(response.body.contenu[1].content_id).toEqual('3');
    expect(response.body.filtres).toHaveLength(7);
    const logement = response.body.filtres.find((a) => a.code === 'logement');
    const climat = response.body.filtres.find((a) => a.code === 'climat');
    expect(logement.selected).toEqual(true);
    expect(logement.label).toEqual('Logement !!');
    expect(climat.selected).toEqual(false);
  });
  it('GET /utilisateurs/id/bibliotheque - renvoie les articles par ordre chronologique', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            like_level: 2,
            read_date: new Date(123).toISOString(),
          },
          {
            content_id: '2',
            like_level: 2,
            read_date: new Date(456).toISOString(),
          },
          {
            content_id: '3',
            like_level: 2,
            read_date: new Date(0).toISOString(),
          },
        ],
      },
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(3);
    expect(response.body.contenu[0].content_id).toEqual('2');
    expect(response.body.contenu[1].content_id).toEqual('1');
    expect(response.body.contenu[2].content_id).toEqual('3');
  });
  it('GET /utilisateurs/id/bibliotheque - recherche par fragment de titre, case insensitive', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            read_date: new Date(1).toISOString(),
          },
          {
            content_id: '2',
            read_date: new Date(2).toISOString(),
          },
          {
            content_id: '3',
            read_date: new Date(3).toISOString(),
          },
          {
            content_id: '4',
            read_date: new Date(4).toISOString(),
          },
        ],
      },
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'hello mistere',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      titre: 'hello mistèr',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      titre: 'pas la même chose',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
      titre: 'Huge Mistery',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque?titre=MISTER',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
    expect(response.body.contenu[0].content_id).toEqual('4');
    expect(response.body.contenu[1].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/bibliotheque - recherche articles favoris', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            read_date: new Date(1).toISOString(),
            favoris: true,
          },
          {
            content_id: '2',
            read_date: new Date(2).toISOString(),
            favoris: false,
          },
          {
            content_id: '3',
            read_date: new Date(3).toISOString(),
            favoris: true,
          },
          {
            content_id: '4',
            read_date: new Date(4).toISOString(),
            favoris: false,
          },
        ],
      },
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });
    await TestUtil.create(DB.article, { content_id: '4' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque?favoris=true',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
    expect(response.body.contenu[0].content_id).toEqual('3');
    expect(response.body.contenu[1].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/bibliotheque - favoris en premier, puis tri par date', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            read_date: new Date(1).toISOString(),
            favoris: true,
          },
          {
            content_id: '2',
            read_date: new Date(2).toISOString(),
            favoris: true,
          },
          {
            content_id: '3',
            read_date: new Date(3).toISOString(),
            favoris: false,
          },
          {
            content_id: '4',
            read_date: new Date(4).toISOString(),
            favoris: false,
          },
        ],
      },
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });
    await TestUtil.create(DB.article, { content_id: '4' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(4);
    expect(response.body.contenu[0].content_id).toEqual('2');
    expect(response.body.contenu[1].content_id).toEqual('1');
    expect(response.body.contenu[2].content_id).toEqual('4');
    expect(response.body.contenu[3].content_id).toEqual('3');
  });
  it('GET /utilisateurs/id/bibliotheque - flag favoris, likes, read_date', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            read_date: new Date(1).toISOString(),
            favoris: false,
            like_level: 1,
          },
          {
            content_id: '2',
            read_date: new Date(2).toISOString(),
            favoris: true,
            like_level: 2,
          },
        ],
      },
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
    expect(response.body.contenu[0].content_id).toEqual('2');
    expect(response.body.contenu[0].favoris).toEqual(true);
    expect(response.body.contenu[0].like_level).toEqual(2);
    expect(response.body.contenu[0].read_date).toEqual(
      new Date(2).toISOString(),
    );
    expect(response.body.contenu[1].content_id).toEqual('1');
    expect(response.body.contenu[1].favoris).toEqual(false);
    expect(response.body.contenu[1].like_level).toEqual(1);
    expect(response.body.contenu[1].read_date).toEqual(
      new Date(1).toISOString(),
    );
  });
  it('GET /utilisateurs/id/bibliotheque/article/123 - renvoi un article unique avec ses meta données', async () => {
    // GIVEN
    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();

    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            read_date: new Date(1).toISOString(),
            favoris: true,
            like_level: 1,
          },
        ],
      },
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      contenu: 'haha {block_123}',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/1',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.content_id).toEqual('1');
    expect(response.body.titre).toEqual('titreA');
    expect(response.body.contenu).toEqual('haha the texte');
    expect(response.body.favoris).toEqual(true);
    expect(response.body.like_level).toEqual(1);
    expect(response.body.read_date).toEqual(new Date(1).toISOString());
  });
  it('GET /utilisateurs/id/bibliotheque/article/123 - renvoi un article non encore lu, sans le méta données', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        version: 0,
        article_interactions: [],
        quizz_interactions: [],
        aide_interactions: [],
      },
    });
    await TestUtil.create(DB.partenaire);
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      partenaire_id: '123',
    });
    await partenaireRepository.loadCache();
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/1',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content_id: '1',
      contenu: 'un long article',
      derniere_maj: null,
      favoris: false,
      image_url: null,
      like_level: null,
      partenaire_logo_url: 'logo_url',
      partenaire_nom: 'ADEME',
      partenaire_url: 'https://ademe.fr',
      points: 10,
      read_date: null,
      sources: [
        {
          label: 'label',
          url: 'url',
        },
      ],
      soustitre: 'Sous titre de mon article',
      thematique_principale: 'logement',
      thematique_principale_label: 'logement',
      thematiques: ['logement'],
      titre: 'titreA',
    });
  });

  it('GET /utilisateurs/id/bibliotheque/article/123 - renvoi un article replace _top _self _parent par _blank', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        version: 0,
        article_interactions: [],
        quizz_interactions: [],
        aide_interactions: [],
      },
    });
    await TestUtil.create(DB.partenaire);
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      partenaire_id: '123',
      contenu: '_top _self _parent',
    });
    await partenaireRepository.loadCache();
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/1',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toEqual('_blank _blank _blank');
  });

  it('GET /utilisateurs/id/bibliotheque/article/123 - renvoi un article inject target="_blank" sur chaque lien', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        version: 0,
        article_interactions: [],
        quizz_interactions: [],
        aide_interactions: [],
      },
    });
    await TestUtil.create(DB.partenaire);
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      partenaire_id: '123',
      contenu: '<a href="https://">bla</a>',
    });
    await partenaireRepository.loadCache();
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/1',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toEqual(
      '<a target="_blank" href="https://">bla</a>',
    );
  });

  it('GET /utilisateurs/id/bibliotheque/article/123 - renvoi un article non encore lu, celui-ci devient alors lu', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        version: 0,
        article_interactions: [],
        quizz_interactions: [],
        aide_interactions: [],
      },
    });
    await TestUtil.create(DB.partenaire);
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      partenaire_id: '123',
    });
    await partenaireRepository.loadCache();
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/1',
    );
    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.history.estArticleLu('1')).toEqual(true);
  });
  it('GET /utilisateurs/id/bibliotheque/article/bad - 404 si article pas connu', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            read_date: new Date(1).toISOString(),
            favoris: true,
            like_level: 1,
          },
        ],
      },
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/bad',
    );
    // THEN
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(`l'article d'id [bad] n'existe pas`);
  });
  it('GET /utilisateurs/id/bibliotheque/quizz/123 - renvoi un quizz non encore réalisé', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        version: 0,
        article_interactions: [],
        quizz_interactions: [],
        aide_interactions: [],
      },
    });
    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();

    await TestUtil.create(DB.partenaire);
    await TestUtil.create(DB.quizz, {
      content_id: '123',
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

    await TestUtil.create(DB.article, {
      content_id: '1',
      contenu: 'un très bon article {block_123}',
      sources: [
        {
          label: 'ADEME',
          url: 'https://',
        },
      ],
    });
    await articleRepository.loadCache();
    await quizzRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/quizz/123',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.content_id).toEqual('123');
    expect(response.body.titre).toEqual('titreA');
    expect(response.body.sousTitre).toEqual('sousTitre');
    expect(response.body.points).toEqual(10);
    expect(response.body.duree).toEqual('pas long');
    expect(response.body.thematique_principale).toEqual(Thematique.climat);
    expect(response.body.difficulty).toEqual(1);
    expect(response.body.article_contenu).toEqual(
      'un très bon article the texte',
    );
    expect(response.body.article_sources).toEqual([
      {
        label: 'ADEME',
        url: 'https://',
      },
    ]);
    expect(response.body.article_id).toEqual('1');
    expect(response.body.questions).toEqual([
      {
        libelle: "Qu'est-ce qu'un embout mousseur ?",
        explicationKO: 'ko',
        explicationOk: 'ok',
        reponses: [
          {
            reponse: "Un composant d'une bombe de crème chantilly",
            exact: false,
          },
          {
            reponse: "Un élément d'une tireuse à bière",
            exact: false,
          },
          {
            reponse: "Un dispositif réduisant le débit d'eau du robinet",
            exact: true,
          },
        ],
      },
    ]);
  });
  it('GET /bibliotheque/article/123 - renvoi un article en mode non connecté', async () => {
    // GIVEN
    await TestUtil.create(DB.partenaire);
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      partenaire_id: '123',
      derniere_maj: new Date(123),
    });
    await partenaireRepository.loadCache();
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/bibliotheque/articles/1');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.content_id).toEqual('1');
    expect(response.body.titre).toEqual('titreA');
    expect(response.body.derniere_maj).toEqual('1970-01-01T00:00:00.123Z');
    expect(response.body.contenu).toEqual('un long article');
    expect(response.body.favoris).toEqual(false);
    expect(response.body.like_level).toEqual(null);
    expect(response.body.read_date).toEqual(null);
    expect(response.body.partenaire_nom).toEqual('ADEME');
    expect(response.body.partenaire_url).toEqual('https://ademe.fr');
    expect(response.body.partenaire_logo_url).toEqual('logo_url');
    expect(response.body.sources).toEqual([{ label: 'label', url: 'url' }]);
  });

  it('GET /bibliotheque/quizz/123 - renvoi un quizz en mode non connnecté', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        version: 0,
        article_interactions: [],
        quizz_interactions: [],
        aide_interactions: [],
      },
    });
    await TestUtil.create(DB.partenaire);
    await TestUtil.create(DB.quizz, {
      content_id: '123',
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

    await TestUtil.create(DB.article, {
      content_id: '1',
      contenu: 'un très bon article',
    });
    await articleRepository.loadCache();
    await quizzRepository.loadCache();

    // WHEN
    const response = await TestUtil.getServer().get('/bibliotheque/quizz/123');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.content_id).toEqual('123');
    expect(response.body.titre).toEqual('titreA');
    expect(response.body.article_contenu).toEqual('un très bon article');
    expect(response.body.article_id).toEqual('1');
  });

  it(`PATCH /utilisateurs/utilisateur-id/bibliotheque/quizz/123 - ajoute un historique de quizz v2, et lecture de l'article`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.quizz, { content_id: '123', article_id: '1' });
    await TestUtil.create(DB.article, {
      content_id: '1',
      contenu: 'un très bon article',
    });
    await articleRepository.loadCache();
    await quizzRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/bibliotheque/quizz/123',
    ).send({
      pourcent: 55,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts,
    ).toHaveLength(1);
    expect(
      dbUtilisateur.history
        .getQuizzHistoryById('123')
        .attempts[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts[0].score,
    ).toEqual(55);
    expect(
      dbUtilisateur.history.getArticleHistoryById('1').read_date.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });
  it(`PATCH /utilisateurs/utilisateur-id/bibliotheque/quizz/123 - valeur 0 OK`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.quizz, { content_id: '123', article_id: '1' });
    await TestUtil.create(DB.article, {
      content_id: '1',
      contenu: 'un très bon article',
    });
    await articleRepository.loadCache();
    await quizzRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/bibliotheque/quizz/123',
    ).send({
      pourcent: 0,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts[0].score,
    ).toEqual(0);
  });
  it(`PATCH /utilisateurs/utilisateur-id/bibliotheque/quizz/123 - valeur 100 OK`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.quizz, { content_id: '123', article_id: '1' });
    await TestUtil.create(DB.article, {
      content_id: '1',
      contenu: 'un très bon article',
    });
    await articleRepository.loadCache();
    await quizzRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/bibliotheque/quizz/123',
    ).send({
      pourcent: 100,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts[0].score,
    ).toEqual(100);
  });

  it('GET /utilisateurs/id/bibliotheque_v2 - renvoie tous les articles, favoris first, puis ordre de lecture decroissant', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: new Date(456),
          favoris: false,
        },
        {
          content_id: '3',
          read_date: new Date(789),
          favoris: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(4);
    expect(response.body.contenu[0].content_id).toEqual('1');
    expect(response.body.contenu[1].content_id).toEqual('3');
    expect(response.body.contenu[2].content_id).toEqual('2');
    expect(response.body.contenu[3].content_id).toEqual('4');
  });

  it('GET /utilisateurs/id/bibliotheque_v2 - renvoie tous les articles, sauf ceux hors code postal', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [],
    };

    const logement: Logement_v0 = {
      chauffage: Chauffage.autre,
      code_postal: '21000',
      commune: 'DIJON',
      dpe: DPE.A,
      nombre_adultes: 1,
      nombre_enfants: 1,
      plus_de_15_ans: true,
      proprietaire: true,
      superficie: Superficie.superficie_150_et_plus,
      type: TypeLogement.appartement,
      version: 0,
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
      logement: logement as any,
      code_commune: '21231',
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      codes_postaux: ['21000'],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      codes_postaux: ['91120'],
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
      codes_postaux: ['91120'],
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
    expect(response.body.contenu[0].content_id).not.toEqual('3');
    expect(response.body.contenu[0].content_id).not.toEqual('4');
    expect(response.body.contenu[1].content_id).not.toEqual('3');
    expect(response.body.contenu[1].content_id).not.toEqual('4');
  });

  it('GET /utilisateurs/id/bibliotheque_v2 - que les favoris', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: null,
          favoris: true,
        },
        {
          content_id: '3',
          read_date: new Date(789),
          favoris: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2?include=favoris',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
  });

  it('GET /utilisateurs/id/bibliotheque_v2 -  favoris et lus', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: new Date(456),
          favoris: false,
        },
        {
          content_id: '3',
          read_date: null,
          favoris: true,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2?include=favoris&include=lu',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(1);
  });

  it('GET /utilisateurs/id/bibliotheque_v2 - que les lus', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: new Date(456),
          favoris: false,
        },
        {
          content_id: '3',
          read_date: null,
          favoris: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2?include=lu',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
    expect(response.body.contenu[0].content_id).toEqual('1');
    expect(response.body.contenu[1].content_id).toEqual('2');
  });

  it('GET /utilisateurs/id/bibliotheque_v2 - include = tout', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: new Date(456),
          favoris: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2?include=tout',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(4);
  });
  it('GET /utilisateurs/id/bibliotheque_v2 - zap les 2 premiers', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: new Date(456),
          favoris: false,
        },
        {
          content_id: '3',
          read_date: new Date(789),
          favoris: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2?skip=2',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(2);
    expect(response.body.contenu[0].content_id).toEqual('2');
    expect(response.body.contenu[1].content_id).toEqual('4');
  });
  it('GET /utilisateurs/id/bibliotheque_v2 - zap les 2 premiers, en prend 1 seul', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: new Date(456),
          favoris: false,
        },
        {
          content_id: '3',
          read_date: new Date(789),
          favoris: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2?skip=2&take=1',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(1);
    expect(response.body.contenu[0].content_id).toEqual('2');
  });
  it('GET /utilisateurs/id/bibliotheque_v2 - juste take', async () => {
    // GIVEN
    const history: History_v0 = {
      aide_interactions: [],
      quizz_interactions: [],
      version: 0,
      article_interactions: [
        {
          content_id: '1',
          read_date: new Date(123),
          favoris: true,
        },
        {
          content_id: '2',
          read_date: new Date(456),
          favoris: false,
        },
        {
          content_id: '3',
          read_date: new Date(789),
          favoris: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
    });
    await TestUtil.create(DB.article, {
      content_id: '4',
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque_v2?take=3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(3);
    expect(response.body.nombre_resultats).toEqual(3);
    expect(response.body.nombre_resultats_disponibles).toEqual(4);
  });
});
