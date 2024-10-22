import { App } from '../../../src/domain/app';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../src/domain/kyc/questionKYC';
import { Superficie } from '../../../src/domain/logement/logement';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { Univers } from '../../../src/domain/univers/univers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/bilan (API test)', () => {
  const OLD_ENV = process.env;
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
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
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.logement,
      label: 'Logement',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 3,
      code: Univers.consommation,
      label: 'Consommation',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 4,
      code: Univers.alimentation,
      label: 'Alimentation',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet).toEqual({
      impact_kg_annee: 9048.184937832844,
      top_3: [
        {
          label: 'Voiture',
          pourcentage: 17,
          pourcentage_categorie: 80,
          impact_kg_annee: 1568.5480530854577,
          emoji: '🚘️',
        },
        {
          label: 'Viandes',
          pourcentage: 13,
          pourcentage_categorie: 52,
          impact_kg_annee: 1207.648,
          emoji: '🥩',
        },
        {
          label: 'Construction',
          pourcentage: 11,
          pourcentage_categorie: 45,
          impact_kg_annee: 968.7934897866139,
          emoji: '🧱',
        },
      ],
      impact_univers: [
        {
          pourcentage: 26,
          univers: 'alimentation',
          univers_label: 'Alimentation',
          impact_kg_annee: 2328.7004821,
          details: [
            {
              label: 'Viandes',
              pourcentage: 13,
              pourcentage_categorie: 52,
              impact_kg_annee: 1207.648,
              emoji: '🥩',
            },
            {
              label: 'Fruits & Légumes',
              pourcentage: 3,
              pourcentage_categorie: 11,
              impact_kg_annee: 252.2,
              emoji: '🥦',
            },
            {
              label: 'Boissons',
              pourcentage: 2,
              pourcentage_categorie: 10,
              impact_kg_annee: 225.37310000000002,
              emoji: '🥤',
            },
            {
              label: 'Poissons',
              pourcentage: 1,
              pourcentage_categorie: 5,
              impact_kg_annee: 125.84,
              emoji: '🐟',
            },
            {
              label: 'Petit déjeuner',
              pourcentage: 1,
              pourcentage_categorie: 5,
              impact_kg_annee: 113.15,
              emoji: '🥐',
            },
          ],
          emoji: '🍴',
        },
        {
          pourcentage: 24,
          univers: 'logement',
          univers_label: 'Logement',
          impact_kg_annee: 2160.200464307907,
          details: [
            {
              label: 'Construction',
              pourcentage: 11,
              pourcentage_categorie: 45,
              impact_kg_annee: 968.7934897866139,
              emoji: '🧱',
            },
            {
              label: 'Chauffage',
              pourcentage: 9,
              pourcentage_categorie: 38,
              impact_kg_annee: 822.4772605840475,
              emoji: '🔥',
            },
            {
              label: 'Vacances',
              pourcentage: 2,
              pourcentage_categorie: 7,
              impact_kg_annee: 152.08498652513995,
              emoji: '🏖',
            },
            {
              label: 'Electricité',
              pourcentage: 1,
              pourcentage_categorie: 6,
              impact_kg_annee: 132.21789018483327,
              emoji: '⚡',
            },
            {
              label: 'Climatisation',
              pourcentage: 1,
              pourcentage_categorie: 3,
              impact_kg_annee: 63.176259272727265,
              emoji: '❄️',
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
          emoji: '🏠',
        },
        {
          pourcentage: 22,
          univers: 'transport',
          univers_label: 'The Transport',
          impact_kg_annee: 1958.4824122240736,
          details: [
            {
              label: 'Voiture',
              pourcentage: 17,
              pourcentage_categorie: 80,
              impact_kg_annee: 1568.5480530854577,
              emoji: '🚘️',
            },
            {
              label: 'Avion',
              pourcentage: 3,
              pourcentage_categorie: 16,
              impact_kg_annee: 312.2395338291978,
              emoji: '✈️',
            },
            {
              label: 'Transports en commun',
              pourcentage: 0,
              pourcentage_categorie: 2,
              impact_kg_annee: 33.7904763482199,
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
              pourcentage_categorie: 1,
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
          emoji: '🚦',
        },
        {
          pourcentage: 16,
          univers: 'services_societaux',
          univers_label: 'Services sociétaux',
          impact_kg_annee: 1450.9052263863641,
          details: [
            {
              label: 'Services publics',
              pourcentage: 14,
              pourcentage_categorie: 87,
              impact_kg_annee: 1259.4428717769142,
              emoji: '🏛',
            },
            {
              label: 'Services marchands',
              pourcentage: 2,
              pourcentage_categorie: 13,
              impact_kg_annee: 191.4623546094499,
              emoji: '✉️',
            },
          ],
          emoji: '🏛️',
        },
        {
          pourcentage: 13,
          univers: 'consommation',
          univers_label: 'Consommation',
          impact_kg_annee: 1149.8963528144989,
          details: [
            {
              label: 'Textile',
              pourcentage: 5,
              pourcentage_categorie: 42,
              impact_kg_annee: 486.13999999999993,
              emoji: '👕',
            },
            {
              label: 'Ameublement',
              pourcentage: 2,
              pourcentage_categorie: 12,
              impact_kg_annee: 139.7448484848485,
              emoji: '🛋️',
            },
            {
              label: 'Autres produits',
              pourcentage: 1,
              pourcentage_categorie: 11,
              impact_kg_annee: 123.01123396773932,
              emoji: '📦',
            },
            {
              label: 'Numérique',
              pourcentage: 1,
              pourcentage_categorie: 10,
              impact_kg_annee: 120.076661030303,
              emoji: '📺',
            },
            {
              label: 'Loisirs',
              pourcentage: 1,
              pourcentage_categorie: 10,
              impact_kg_annee: 118.99921707433923,
              emoji: '🎭',
            },
            {
              label: 'Electroménager',
              pourcentage: 1,
              pourcentage_categorie: 7,
              impact_kg_annee: 75.44090909090907,
              emoji: '🔌',
            },
            {
              label: 'Animaux',
              pourcentage: 1,
              pourcentage_categorie: 5,
              impact_kg_annee: 53.11748316635982,
              emoji: '🐶',
            },
            {
              label: 'Tabac',
              pourcentage: 0,
              pourcentage_categorie: 1,
              impact_kg_annee: 7.28,
              emoji: '🚬',
            },
          ],
          emoji: '📦',
        },
      ],
    });
  });

  it('GET /utilisateur/id/bilans/last - presence du bilan de synthese', async () => {
    // GIVEN
    const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.transport,
      label: 'The Transport',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.logement,
      label: 'Logement',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 3,
      code: Univers.consommation,
      label: 'Consommation',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 4,
      code: Univers.alimentation,
      label: 'Alimentation',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_synthese).toEqual({
      impact_transport: null,
      impact_alimentation: null,
      impact_logement: null,
      impact_consommation: null,
      pourcentage_completion_totale: 0,
      liens_bilans_univers: [
        {
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_transport',
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728466903/Mobilite_df75aefd09.svg',
          nombre_total_question: 0,
          pourcentage_progression: null,
          univers: 'transport',
          univers_label: 'The Transport',
          temps_minutes: 5,
        },
        {
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_alimentation',
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728466523/cuisine_da54797693.svg',
          nombre_total_question: 1,
          pourcentage_progression: 0,
          univers: 'alimentation',
          univers_label: 'Alimentation',
          temps_minutes: 3,
        },
        {
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_consommation',
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728468852/conso_7522b1950d.svg',
          nombre_total_question: 6,
          pourcentage_progression: 0,
          univers: 'consommation',
          univers_label: 'Consommation',
          temps_minutes: 10,
        },
        {
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_logement',
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728468978/maison_80242d91f3.svg',
          nombre_total_question: 2,
          pourcentage_progression: 0,
          univers: 'logement',
          univers_label: 'Logement',
          temps_minutes: 9,
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
    expect(response.body.bilan_complet.impact_kg_annee).toEqual(
      11365.866563693477,
    );
  });

  it('GET /utilisateur/id/bilans/last - une réponse vide ne fait pas crasher le bilan carbone', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC006,
          id_cms: 3,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          categorie: Categorie.test,
          points: 10,
          reponses: [],
          reponses_possibles: [],
          tags: [],
          universes: [Univers.climat],
          ngc_key: 'logement . âge',
          short_question: 'short',
          image_url: 'AAA',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet.impact_kg_annee).toEqual(
      9048.184937832844,
    );
  });

  it('POST /bilan/importFromNGC - missing API KEY', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/bilan/importFromNGC').send({
      situation: {
        'transport . voiture . km': 12000,
      },
    });

    //THEN
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      code: '080',
      message: "Clé API manquante (header 'apikey')",
      statusCode: 401,
    });
  });
  it('POST /bilan/importFromNGC - bad API KEY', async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';
    // WHEN
    const response = await TestUtil.POST('/bilan/importFromNGC')
      .set('apikey', `bad`)
      .send({
        situation: {
          'transport . voiture . km': 12000,
        },
      });

    //THEN
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      code: '081',
      message: 'Clé API [bad] incorrecte',
      statusCode: 403,
    });
  });
  it('POST /bilan/importFromNGC - creates new situation', async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';
    // WHEN
    const response = await TestUtil.POST('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
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

    expect(response.body.redirect_url).toEqual(
      `${App.getBaseURLFront()}/creation-compte/nos-gestes-climat?situationId=${
        situationDB[0].id
      }&bilan_tonnes=10`,
    );
  });
  it('POST /bilan/importFromNGC - creates new situation alors que erreur de contenu, 8 tonnes par défaut ^^', async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';
    // WHEN
    const response = await TestUtil.POST('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'C est vraiement pas bon': 'dfsgsdg',
        },
      });

    //THEN
    expect(response.status).toBe(201);
    const situationDB = await TestUtil.prisma.situationNGC.findMany({});
    expect(situationDB).toHaveLength(1);
    expect(situationDB[0].situation).toStrictEqual({
      'C est vraiement pas bon': 'dfsgsdg',
    });

    expect(response.body.redirect_url).toEqual(
      `${App.getBaseURLFront()}/creation-compte/nos-gestes-climat?situationId=${
        situationDB[0].id
      }&bilan_tonnes=8`,
    );
  });
});
