import { Categorie } from '../../../src/domain/contenu/categorie';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/bibliotheque (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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
    await thematiqueRepository.loadThematiques();
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            like_level: 2,
            points_en_poche: true,
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
    await thematiqueRepository.loadThematiques();
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            like_level: 2,
            points_en_poche: true,
            read_date: new Date(123).toISOString(),
          },
          {
            content_id: '2',
            like_level: 2,
            points_en_poche: true,
            read_date: new Date(123).toISOString(),
          },
          {
            content_id: '3',
            like_level: 2,
            points_en_poche: true,
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
            points_en_poche: true,
            read_date: new Date(123).toISOString(),
          },
          {
            content_id: '2',
            like_level: 2,
            points_en_poche: true,
            read_date: new Date(456).toISOString(),
          },
          {
            content_id: '3',
            like_level: 2,
            points_en_poche: true,
            read_date: new Date(0).toISOString(),
          },
        ],
      },
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });
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
    await TestUtil.create(DB.article, { content_id: '1', titre: 'titreA' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/1',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.content_id).toEqual('1');
    expect(response.body.titre).toEqual('titreA');
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
    await partenaireRepository.loadPartenaires();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque/articles/1',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.content_id).toEqual('1');
    expect(response.body.titre).toEqual('titreA');
    expect(response.body.contenu).toEqual('un long article');
    expect(response.body.favoris).toEqual(false);
    expect(response.body.like_level).toEqual(null);
    expect(response.body.read_date).toEqual(null);
    expect(response.body.partenaire_nom).toEqual('ADEME');
    expect(response.body.partenaire_url).toEqual('https://ademe.fr');
    expect(response.body.partenaire_logo_url).toEqual('logo_url');
    expect(response.body.sources).toEqual([{ label: 'label', url: 'url' }]);
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
    await partenaireRepository.loadPartenaires();

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
    expect(response.body.article_contenu).toEqual('un très bon article');
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
});
