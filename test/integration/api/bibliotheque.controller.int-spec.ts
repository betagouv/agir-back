import { Thematique } from '../../../src/domain/contenu/thematique';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/bibliotheque (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

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
    await thematiqueRepository.upsertThematique(1, 'Alimentation !!');
    await thematiqueRepository.upsertThematique(2, 'Climat !!');
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
    expect(response.body.filtres[0].selected).toEqual(true);
    expect(response.body.filtres[1].selected).toEqual(true);
    expect(response.body.filtres[2].selected).toEqual(true);
    expect(response.body.filtres[3].selected).toEqual(true);
    expect(response.body.filtres[4].selected).toEqual(true);
    expect(response.body.filtres[5].selected).toEqual(true);
    expect(response.body.filtres[6].selected).toEqual(true);
  });
  it('GET /utilisateurs/id/bibliotheque - renvoie les articles de bonne thematique', async () => {
    // GIVEN
    await thematiqueRepository.upsertThematique(1, 'Alimentation !!');
    await thematiqueRepository.upsertThematique(2, 'Climat !!');
    await thematiqueRepository.upsertThematique(5, 'Logement !!');
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
});
