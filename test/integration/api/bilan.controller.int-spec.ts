import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { Superficie } from '../../../src/domain/logement/logement';
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
    delete response.body.detail;

    expect(response.body).toEqual({
      impact_kg_annee: 8898.031054479543,
      top_3: [
        {
          label: 'Voiture',
          emoji: '🚘️',
          pourcentage: 25,
          pourcentage_categorie: 79,
          impact_kg_annee: 2199.540741358343,
        },
        {
          label: 'Chauffage',
          emoji: '🔥',
          pourcentage: 9,
          pourcentage_categorie: 56,
          impact_kg_annee: 822.4772605840475,
        },
        {
          label: 'Avion',
          emoji: '✈️',
          pourcentage: 4,
          pourcentage_categorie: 11,
          impact_kg_annee: 312.2395338291978,
        },
      ],
      impact_univers: [
        {
          pourcentage: 31,
          univers: 'transport',
          univers_label: 'The Transport',
          impact_kg_annee: 2796.1001241487393,
          details: [
            {
              label: 'Voiture',
              pourcentage: 25,
              pourcentage_categorie: 79,
              impact_kg_annee: 2199.540741358343,
              emoji: '🚘️',
            },
            {
              label: 'Avion',
              pourcentage: 4,
              pourcentage_categorie: 11,
              impact_kg_annee: 312.2395338291978,
              emoji: '✈️',
            },
            {
              label: 'Transports en commun',
              pourcentage: 3,
              pourcentage_categorie: 9,
              impact_kg_annee: 240.41550000000004,
              emoji: '🚌',
            },
            {
              label: '2 roues',
              pourcentage: 0,
              pourcentage_categorie: 1,
              impact_kg_annee: 23.196418035061875,
              emoji: '🛵',
            },
            {
              label: 'Ferry',
              pourcentage: 0,
              pourcentage_categorie: 0,
              impact_kg_annee: 11.88805068661542,
              emoji: '⛴',
            },
            {
              label: 'Train',
              pourcentage: 0,
              pourcentage_categorie: 0,
              impact_kg_annee: 8.8198802395209,
              emoji: '🚋',
            },
            {
              label: 'Mobilité douce',
              pourcentage: 0,
              pourcentage_categorie: 0,
              impact_kg_annee: 0,
              emoji: '🚲',
            },
            {
              label: 'Vacances',
              pourcentage: 0,
              pourcentage_categorie: 0,
              impact_kg_annee: 0,
              emoji: '🏖️',
            },
          ],
        },
        {
          pourcentage: 24,
          univers: 'alimentation',
          univers_label: 'En cuisine',
          impact_kg_annee: 2094.1568221,
          details: [],
        },
        {
          pourcentage: 17,
          univers: 'logement',
          univers_label: 'Titre manquant',
          impact_kg_annee: 1477.82343812085,
          details: [
            {
              label: 'Chauffage',
              pourcentage: 9,
              pourcentage_categorie: 56,
              impact_kg_annee: 822.4772605840475,
              emoji: '🔥',
            },
            {
              label: 'Construction',
              pourcentage: 4,
              pourcentage_categorie: 24,
              impact_kg_annee: 350.45330368080613,
              emoji: '🧱',
            },
            {
              label: 'Electricité',
              pourcentage: 1,
              pourcentage_categorie: 9,
              impact_kg_annee: 132.21789018483327,
              emoji: '⚡',
            },
            {
              label: 'Climatisation',
              pourcentage: 1,
              pourcentage_categorie: 5,
              impact_kg_annee: 76.80251127272726,
              emoji: '❄️',
            },
            {
              label: 'Vacances',
              pourcentage: 1,
              pourcentage_categorie: 5,
              impact_kg_annee: 74.42189444389041,
              emoji: '🏖',
            },
            {
              label: 'Extérieur',
              pourcentage: 0,
              pourcentage_categorie: 1,
              impact_kg_annee: 21.45057795454545,
              emoji: '☘️',
            },
            {
              label: 'Piscine',
              pourcentage: 0,
              pourcentage_categorie: 0,
              impact_kg_annee: 0,
              emoji: '🏊',
            },
          ],
        },
        {
          pourcentage: 16,
          univers: 'services_societaux',
          univers_label: 'Titre manquant',
          impact_kg_annee: 1450.9052263863641,
          details: [],
        },
        {
          pourcentage: 12,
          univers: 'consommation',
          univers_label: 'Titre manquant',
          impact_kg_annee: 1079.0454437235896,
          details: [],
        },
      ],
    });
  });

  it('GET /utilisateur/id/bilans/last - mettre à jour le profil utilisateur change le bilan', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 4,
      code: KYCID.KYC_superficie,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.test,
      points: 10,
      question: 'Superficie',
      is_ngc: true,
      ngc_key: 'logement . surface',
      reponses: [],
    });

    // WHEN
    const rep = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      superficie: Superficie.superficie_150_et_plus,
    });
    expect(rep.status).toBe(200);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.impact_kg_annee).toEqual(10470.652034983415);
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
