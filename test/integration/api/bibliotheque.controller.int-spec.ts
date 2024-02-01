import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/bibliotheque (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterEach(() => {});

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/recommandation - 403 if bad id', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {} });
    await TestUtil.create('article');
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/autre-id/bibliotheque');
    // THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateurs/id/recommandation - 200 et liste vide', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {} });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(0);
  });
  it('GET /utilisateurs/id/recommandation - ne renvoie pas un article non lu', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {} });
    await TestUtil.create('article');
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(0);
  });
  it('GET /utilisateurs/id/recommandation - ne renvoie pas un article non lu', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {} });
    await TestUtil.create('article');
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bibliotheque',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.contenu).toHaveLength(0);
  });
  it('GET /utilisateurs/id/recommandation - renvoie un article  lu', async () => {
    // GIVEN
    await thematiqueRepository.upsertThematique(1, 'Alimentation !!');
    await thematiqueRepository.upsertThematique(2, 'Climat !!');
    await thematiqueRepository.loadThematiques();
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('article');
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
  });
});
