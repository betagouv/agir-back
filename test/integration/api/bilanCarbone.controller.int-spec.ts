import { KYC } from '@prisma/client';
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
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { Feature } from '../../../src/domain/gamification/feature';
import { Thematique } from '../../../src/domain/contenu/thematique';

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

    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [Feature.bilan_carbone_detail],
    };
    await TestUtil.create(DB.utilisateur, { unlocked_features: unlocked });

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.transport,
      titre: 'The Transport',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.logement,
      titre: 'Logement',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.consommation,
      titre: 'Consommation',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 4,
      code: Thematique.alimentation,
      titre: 'Alimentation',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 5,
      code: Thematique.services_societaux,
      titre: 'Services sociétaux',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet).toEqual({
      impact_kg_annee: 8817.899984641037,
      top_3: [
        {
          label: 'Voiture',
          pourcentage: 17,
          pourcentage_categorie: 79,
          impact_kg_annee: 1479.8813864187912,
          emoji: '🚘️',
        },
        {
          label: 'Viandes',
          pourcentage: 14,
          pourcentage_categorie: 52,
          impact_kg_annee: 1207.648,
          emoji: '🥩',
        },
        {
          label: 'Construction',
          pourcentage: 11,
          pourcentage_categorie: 48,
          impact_kg_annee: 968.7934897866139,
          emoji: '🧱',
        },
      ],
      impact_univers: [
        {
          pourcentage: 27,
          univers: 'alimentation',
          univers_label: 'Alimentation',
          impact_kg_annee: 2339.1671821,
          details: [
            {
              label: 'Viandes',
              pourcentage: 14,
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
              pourcentage: 3,
              pourcentage_categorie: 10,
              impact_kg_annee: 235.8398,
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
          pourcentage: 23,
          univers: 'logement',
          univers_label: 'Logement',
          impact_kg_annee: 2008.1154777827674,
          details: [
            {
              label: 'Construction',
              pourcentage: 11,
              pourcentage_categorie: 48,
              impact_kg_annee: 968.7934897866139,
              emoji: '🧱',
            },
            {
              label: 'Chauffage',
              pourcentage: 9,
              pourcentage_categorie: 41,
              impact_kg_annee: 822.4772605840475,
              emoji: '🔥',
            },
            {
              label: 'Electricité',
              pourcentage: 1,
              pourcentage_categorie: 7,
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
            {
              label: 'Vacances',
              pourcentage: 0,
              pourcentage_categorie: 0,
              impact_kg_annee: 0,
              emoji: '🏖',
            },
          ],
          emoji: '🏠',
        },
        {
          pourcentage: 21,
          univers: 'transport',
          univers_label: 'The Transport',
          impact_kg_annee: 1869.8157455574071,
          details: [
            {
              label: 'Voiture',
              pourcentage: 17,
              pourcentage_categorie: 79,
              impact_kg_annee: 1479.8813864187912,
              emoji: '🚘️',
            },
            {
              label: 'Avion',
              pourcentage: 4,
              pourcentage_categorie: 17,
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
              pourcentage: 6,
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

  it('GET /utilisateur/id/bilans/last_v2 - get last bilan with proper data', async () => {
    // GIVEN
    const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_alimentation_regime,
      question: `YOP`,
      reponses: [
        { code: 'vegetalien', label: 'Vegetalien', ngc_code: null },
        { code: 'vegetarien', label: 'Vegetarien', ngc_code: null },
        { code: 'peu_viande', label: 'Peu de viande', ngc_code: null },
        { code: 'chaque_jour_viande', label: 'Tous les jours', ngc_code: null },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_saison_frequence',
          id_cms: 21,
          question: `À quelle fréquence mangez-vous de saison ? `,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponses: [
            { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
          ],
          reponses_possibles: [
            { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
            { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
            { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
          ],
          tags: [],
          universes: [],
          ngc_key: 'alimentation . de saison . consommation',
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
        {
          id: 'KYC_alimentation_regime',
          id_cms: 1,
          question: `Votre regime`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponses: [
            { code: 'vegetalien', label: 'Vegetalien', ngc_code: null },
          ],
          reponses_possibles: [
            { code: 'vegetalien', label: 'Vegetalien', ngc_code: null },
            { code: 'vegetarien', label: 'Vegetarien', ngc_code: null },
            { code: 'peu_viande', label: 'Peu de viande', ngc_code: null },
            {
              code: 'chaque_jour_viande',
              label: 'Tous les jours',
              ngc_code: null,
            },
          ],
          tags: [],
          universes: [],
          ngc_key: null,
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC_saison_frequence',
      id_cms: 21,
      question: `À quelle fréquence mangez-vous de saison ? `,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      reponses: [
        { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
        { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
        { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
      ],
      tags: [],
      universes: [],
      ngc_key: 'alimentation . de saison . consommation',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [Feature.bilan_carbone_detail],
    };
    await TestUtil.create(DB.utilisateur, {
      unlocked_features: unlocked,
      kyc: kyc,
    });

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.transport,
      titre: 'The Transport',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.logement,
      titre: 'Logement',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.consommation,
      titre: 'Consommation',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 4,
      code: Thematique.alimentation,
      titre: 'Alimentation',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 5,
      code: Thematique.services_societaux,
      titre: 'Services sociétaux',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last_v2?force=true',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.pourcentage_completion_totale).toEqual(21);
    expect(response.body.liens_bilans_univers).toEqual([
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
        nombre_total_question: 3,
        pourcentage_progression: 67,
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
        nombre_total_question: 3,
        pourcentage_progression: 0,
        univers: 'logement',
        univers_label: 'Logement',
        temps_minutes: 9,
      },
    ]);
    expect(response.body.bilan_approximatif).toEqual({
      impact_transport: null,
      impact_alimentation: 'faible',
      impact_logement: null,
      impact_consommation: null,
    });
    expect(response.body.bilan_complet).toEqual({
      impact_kg_annee: 8781.353920090594,
      top_3: [
        {
          label: 'Voiture',
          pourcentage: 17,
          pourcentage_categorie: 79,
          impact_kg_annee: 1479.8813864187912,
          emoji: '🚘️',
        },
        {
          label: 'Viandes',
          pourcentage: 14,
          pourcentage_categorie: 52,
          impact_kg_annee: 1207.648,
          emoji: '🥩',
        },
        {
          label: 'Construction',
          pourcentage: 11,
          pourcentage_categorie: 48,
          impact_kg_annee: 968.7934897866139,
          emoji: '🧱',
        },
      ],
      impact_univers: [
        {
          pourcentage: 26,
          univers: 'alimentation',
          univers_label: 'Alimentation',
          impact_kg_annee: 2302.6211175495578,
          details: [
            {
              label: 'Viandes',
              pourcentage: 14,
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
              pourcentage: 3,
              pourcentage_categorie: 10,
              impact_kg_annee: 235.8398,
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
          pourcentage: 23,
          univers: 'logement',
          univers_label: 'Logement',
          impact_kg_annee: 2008.1154777827674,
          details: [
            {
              label: 'Construction',
              pourcentage: 11,
              pourcentage_categorie: 48,
              impact_kg_annee: 968.7934897866139,
              emoji: '🧱',
            },
            {
              label: 'Chauffage',
              pourcentage: 9,
              pourcentage_categorie: 41,
              impact_kg_annee: 822.4772605840475,
              emoji: '🔥',
            },
            {
              label: 'Electricité',
              pourcentage: 2,
              pourcentage_categorie: 7,
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
            {
              label: 'Vacances',
              pourcentage: 0,
              pourcentage_categorie: 0,
              impact_kg_annee: 0,
              emoji: '🏖',
            },
          ],
          emoji: '🏠',
        },
        {
          pourcentage: 21,
          univers: 'transport',
          univers_label: 'The Transport',
          impact_kg_annee: 1869.8157455574071,
          details: [
            {
              label: 'Voiture',
              pourcentage: 17,
              pourcentage_categorie: 79,
              impact_kg_annee: 1479.8813864187912,
              emoji: '🚘️',
            },
            {
              label: 'Avion',
              pourcentage: 4,
              pourcentage_categorie: 17,
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
          pourcentage: 17,
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
              pourcentage: 6,
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

  it('GET /utilisateur/id/bilans/last - presence du bilan de synthese et mini bilan', async () => {
    // GIVEN
    const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.transport,
      titre: 'The Transport',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.logement,
      titre: 'Logement',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.consommation,
      titre: 'Consommation',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 4,
      code: Thematique.alimentation,
      titre: 'Alimentation',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.mini_bilan).toEqual({
      impact_transport: null,
      impact_alimentation: null,
      impact_logement: null,
      impact_consommation: null,
    });

    expect(response.body.bilan_synthese).toEqual({
      bilan_complet_dispo: false,
      mini_bilan_dispo: false,
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
          nombre_total_question: 3,
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
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [Feature.bilan_carbone_detail],
    };
    await TestUtil.create(DB.utilisateur, { unlocked_features: unlocked });
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
      11135.581610501671,
    );
  });

  it('GET /utilisateur/id/bilans/last - une réponse vide ne fait pas crasher le bilan carbone', async () => {
    // GIVEN
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [Feature.bilan_carbone_detail],
    };

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
          a_supprimer: false,
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
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      unlocked_features: unlocked,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet.impact_kg_annee).toEqual(
      8817.899984641037,
    );
  });
  it('GET /utilisateur/id/bilans/last - pas de bilan détaillé si feature pas unlocked', async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_synthese.bilan_complet_dispo).toEqual(false);
    expect(response.body.bilan_complet).not.toBeUndefined();
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
      }&bilan_tonnes=9.5`,
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

  it(`POST /utlilisateurs/compute_bilan_carbone bilan carbon utilisteur sans aucune reponse NGC`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_bilan_carbone');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('utilisateur-id');

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });

    expect(stats.situation).toEqual({});
    expect(stats.total_g).toEqual(8817899);
    expect(stats.transport_g).toEqual(1869815);
    expect(stats.alimenation_g).toEqual(2339167);
  });
  it(`POST /utlilisateurs/compute_bilan_carbone bilan carbon utilisteur avec une reponse alimentationNGC`, async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: 'KYC_saison_frequence',
          id_cms: 21,
          question: `À quelle fréquence mangez-vous de saison ? `,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponses: [
            { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
          ],
          reponses_possibles: [
            { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
            { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
            { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
          ],
          tags: [],
          universes: [],
          ngc_key: 'alimentation . de saison . consommation',
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC_saison_frequence',
      id_cms: 21,
      question: `À quelle fréquence mangez-vous de saison ? `,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      reponses: [
        { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
        { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
        { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
      ],
      tags: [],
      universes: [],
      ngc_key: 'alimentation . de saison . consommation',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_bilan_carbone');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('utilisateur-id');

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });

    expect(stats.situation).toEqual({
      'alimentation . de saison . consommation': '"souvent"',
    });
    expect(stats.total_g).toEqual(8781353);
    expect(stats.transport_g).toEqual(1869815);
    expect(stats.alimenation_g).toEqual(2302621);
  });
});
