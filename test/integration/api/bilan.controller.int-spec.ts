import { Univers } from '../../../src/domain/univers/univers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/bilan (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateur/id/bilans/last - 403 if bad id', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC);
    await TestUtil.create(DB.empreinte);

    // WHEN
    const response = await TestUtil.GET('/utilisateur/autre-id/bilans/last');

    //THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateur/id/bilans/last - get last bilan with proper data', async () => {
    // GIVEN
    const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.transport,
      label: 'The Transport',
      image_url: 'aaaa',
      is_locked: false,
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'En cuisine',
      image_url: 'bbbb',
      is_locked: false,
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      impact_kg_annee: 8898.031054479543,
      detail: [
        {
          pourcentage: 31,
          univers: 'transport',
          univers_label: 'The Transport',
          impact_kg_annee: 2796.1001241487393,
        },
        {
          pourcentage: 24,
          univers: 'alimentation',
          univers_label: 'En cuisine',
          impact_kg_annee: 2094.1568221,
        },
        {
          pourcentage: 17,
          univers: 'logement',
          univers_label: 'Titre manquant',
          impact_kg_annee: 1477.82343812085,
        },
        {
          pourcentage: 16,
          univers: 'services_societaux',
          univers_label: 'Titre manquant',
          impact_kg_annee: 1450.9052263863641,
        },
        {
          pourcentage: 12,
          univers: 'consommation',
          univers_label: 'Titre manquant',
          impact_kg_annee: 1079.0454437235896,
        },
      ],
    });
  });
  it('POST /utilisateur/id/bilans - compute and create new Bilan', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/bilans/situationNGC-id',
    );

    //THEN
    expect(response.status).toBe(201);

    const bilanDB = await TestUtil.prisma.empreinte.findMany({
      include: { situation: true },
    });
    expect(bilanDB).toHaveLength(1);
    expect(bilanDB[0]['situation'].situation).toStrictEqual({
      'transport . voiture . km': 12000,
    });
    expect(Math.floor(bilanDB[0].bilan['details'].transport)).toStrictEqual(
      2760,
    );
    expect(Math.floor(bilanDB[0].bilan['details'].alimentation)).toStrictEqual(
      2094,
    );
  });
  it('POST /bilan/importFromNGC - creates new situation', async () => {
    // WHEN
    const response = await TestUtil.POST('/bilan/importFromNGC').send({
      situation: {
        'transport . voiture . km': 12000,
      },
    });

    //THEN
    expect(response.status).toBe(201);

    const situationDB = await TestUtil.prisma.situationNGC.findMany({});
    expect(situationDB).toHaveLength(1);
    expect(situationDB[0].situation).toStrictEqual({
      'transport . voiture . km': 12000,
    });
  });
});
