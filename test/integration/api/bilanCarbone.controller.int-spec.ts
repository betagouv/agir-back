import { KYC } from '@prisma/client';
import { App } from '../../../src/domain/app';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../src/domain/kyc/questionKYC';
import { Superficie } from '../../../src/domain/logement/logement';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { DB, TestUtil } from '../../TestUtil';
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { Feature } from '../../../src/domain/gamification/feature';
import { Thematique } from '../../../src/domain/contenu/thematique';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';

const KYC_DATA: QuestionKYC_v2 = {
  code: 'KYC_saison_frequence',
  id_cms: 21,
  question: `À quelle fréquence mangez-vous de saison ? `,
  type: TypeReponseQuestionKYC.choix_unique,
  is_NGC: true,
  a_supprimer: false,
  categorie: Categorie.mission,
  points: 10,
  last_update: undefined,
  reponse_complexe: [
    {
      label: 'Souvent',
      code: 'souvent',
      ngc_code: '"souvent"',
      selected: true,
    },
    {
      label: 'Jamais',
      code: 'jamais',
      ngc_code: '"bof"',
      selected: false,
    },
    {
      label: 'Parfois',
      code: 'parfois',
      ngc_code: '"burp"',
      selected: false,
    },
  ],
  tags: [],
  ngc_key: 'alimentation . de saison . consommation',
  image_url: '111',
  short_question: 'short',
  conditions: [],
  unite: Unite.kg,
  emoji: '🔥',
  reponse_simple: undefined,
  thematique: Thematique.alimentation,
};

const DEFAULT_TOTAL_KG = 8900.305086108707;
const DEFAULT_TOTAL_G = 8900305;
const DEFAULT_TRANSPORT_G = 1958482;
const DEFAULT_ALIMENTATION_G = 2339167;

describe('/bilan (API test)', () => {
  const kycRepository = new KycRepository(TestUtil.prisma);

  const OLD_ENV = process.env;
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/bilans/last_v3 - get last bilan with proper data', async () => {
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
      '/utilisateurs/utilisateur-id/bilans/last_v3',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet).toEqual({
      impact_kg_annee: DEFAULT_TOTAL_KG,
      top_3: [
        {
          label: 'Voiture',
          pourcentage: 18,
          pourcentage_categorie: 80,
          impact_kg_annee: 1568.5480530854577,
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
          pourcentage_categorie: 45,
          impact_kg_annee: 968.7934897866139,
          emoji: '🧱',
        },
      ],
      impact_thematique: [
        {
          pourcentage: 26,
          thematique: 'alimentation',
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
          pourcentage: 24,
          thematique: 'logement',
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
          thematique: 'transport',
          impact_kg_annee: 1958.4824122240736,
          details: [
            {
              label: 'Voiture',
              pourcentage: 18,
              pourcentage_categorie: 80,
              impact_kg_annee: 1568.5480530854577,
              emoji: '🚘️',
            },
            {
              label: 'Avion',
              pourcentage: 4,
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
            // FIXME: Les vacances sont à la fois comptées dans la thématique
            // transport et à la fois dans la thématique logement.
            // FIXME: Est-ce que l'on ne devrait pas rajouter un test qui
            // vérifie que la somme de tous les pourcentages = 100% ?
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
          thematique: 'services_societaux',
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
          pourcentage: 11,
          thematique: 'consommation',
          impact_kg_annee: 991.5498010903609,
          details: [
            {
              label: 'Textile',
              pourcentage: 4,
              pourcentage_categorie: 33,
              impact_kg_annee: 327.79344827586203,
              emoji: '👕',
            },
            {
              label: 'Ameublement',
              pourcentage: 2,
              pourcentage_categorie: 14,
              impact_kg_annee: 139.7448484848485,
              emoji: '🛋️',
            },
            {
              label: 'Autres produits',
              pourcentage: 1,
              pourcentage_categorie: 12,
              impact_kg_annee: 123.01123396773932,
              emoji: '📦',
            },
            {
              label: 'Numérique',
              pourcentage: 1,
              pourcentage_categorie: 12,
              impact_kg_annee: 120.076661030303,
              emoji: '📺',
            },
            {
              label: 'Loisirs',
              pourcentage: 1,
              pourcentage_categorie: 12,
              impact_kg_annee: 118.99921707433923,
              emoji: '🎭',
            },
            {
              label: 'Electroménager',
              pourcentage: 1,
              pourcentage_categorie: 8,
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

  it('GET /utilisateurs/id/bilans/last_v3 - get last bilan with proper data #2', async () => {
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

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          code: 'KYC_saison_frequence',
          last_update: undefined,
          id_cms: 21,
          question: `À quelle fréquence mangez-vous de saison ? `,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponse_complexe: [
            {
              label: 'Souvent',
              code: 'souvent',
              ngc_code: '"souvent"',
              value: 'oui',
              selected: true,
            },
            {
              label: 'Jamais',
              code: 'jamais',
              ngc_code: '"bof"',
              selected: false,
            },
            {
              label: 'Parfois',
              code: 'parfois',
              ngc_code: '"burp"',
              selected: false,
            },
          ],
          tags: [],
          ngc_key: 'alimentation . de saison . consommation',
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
          reponse_simple: undefined,
          thematique: Thematique.alimentation,
        },
        {
          code: 'KYC_alimentation_regime',
          id_cms: 1,
          last_update: undefined,
          question: `Votre regime`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponse_complexe: [
            {
              code: 'vegetalien',
              label: 'Vegetalien',
              ngc_code: null,
              selected: true,
            },
            {
              code: 'vegetarien',
              label: 'Vegetarien',
              ngc_code: null,
              selected: false,
            },
            {
              code: 'peu_viande',
              label: 'Peu de viande',
              ngc_code: null,
              selected: false,
            },
            {
              code: 'chaque_jour_viande',
              label: 'Tous les jours',
              ngc_code: null,
              selected: false,
            },
          ],
          tags: [],
          ngc_key: null,
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
          thematique: Thematique.alimentation,
          reponse_simple: undefined,
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
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/last_v3?force=true',
    );

    //THEN
    expect(response.status).toBe(200);
    console.log(response.body);
    expect(response.body.pourcentage_completion_totale).toEqual(21);
    expect(response.body.liens_bilans_thematique).toEqual([
      {
        id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_transport',
        image_url:
          'https://res.cloudinary.com/dq023imd8/image/upload/v1728466903/Mobilite_df75aefd09.svg',
        nombre_total_question: 0,
        pourcentage_progression: null,
        thematique: 'transport',
        temps_minutes: 5,
      },
      {
        id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_alimentation',
        image_url:
          'https://res.cloudinary.com/dq023imd8/image/upload/v1728466523/cuisine_da54797693.svg',
        nombre_total_question: 3,
        pourcentage_progression: 67,
        thematique: 'alimentation',
        temps_minutes: 3,
      },
      {
        id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_consommation',
        image_url:
          'https://res.cloudinary.com/dq023imd8/image/upload/v1728468852/conso_7522b1950d.svg',
        nombre_total_question: 6,
        pourcentage_progression: 0,
        thematique: 'consommation',
        temps_minutes: 10,
      },
      {
        id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_logement',
        image_url:
          'https://res.cloudinary.com/dq023imd8/image/upload/v1728468978/maison_80242d91f3.svg',
        nombre_total_question: 3,
        pourcentage_progression: 0,
        thematique: 'logement',
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
      impact_kg_annee: 8863.759021558264,
      top_3: [
        {
          label: 'Voiture',
          pourcentage: 18,
          pourcentage_categorie: 80,
          impact_kg_annee: 1568.5480530854577,
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
          pourcentage_categorie: 45,
          impact_kg_annee: 968.7934897866139,
          emoji: '🧱',
        },
      ],
      impact_thematique: [
        {
          pourcentage: 26,
          thematique: 'alimentation',
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
          pourcentage: 24,
          thematique: 'logement',
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
          thematique: 'transport',
          impact_kg_annee: 1958.4824122240736,
          details: [
            {
              label: 'Voiture',
              pourcentage: 18,
              pourcentage_categorie: 80,
              impact_kg_annee: 1568.5480530854577,
              emoji: '🚘️',
            },
            {
              label: 'Avion',
              pourcentage: 4,
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
            // FIXME: doublon avec transport
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
          thematique: 'services_societaux',
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
          pourcentage: 11,
          thematique: 'consommation',
          impact_kg_annee: 991.5498010903609,
          details: [
            {
              label: 'Textile',
              pourcentage: 4,
              pourcentage_categorie: 33,
              impact_kg_annee: 327.79344827586203,
              emoji: '👕',
            },
            {
              label: 'Ameublement',
              pourcentage: 2,
              pourcentage_categorie: 14,
              impact_kg_annee: 139.7448484848485,
              emoji: '🛋️',
            },
            {
              label: 'Autres produits',
              pourcentage: 1,
              pourcentage_categorie: 12,
              impact_kg_annee: 123.01123396773932,
              emoji: '📦',
            },
            {
              label: 'Numérique',
              pourcentage: 1,
              pourcentage_categorie: 12,
              impact_kg_annee: 120.076661030303,
              emoji: '📺',
            },
            {
              label: 'Loisirs',
              pourcentage: 1,
              pourcentage_categorie: 12,
              impact_kg_annee: 118.99921707433923,
              emoji: '🎭',
            },
            {
              label: 'Electroménager',
              pourcentage: 1,
              pourcentage_categorie: 8,
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

  it('GET /utilisateurs/id/bilans/last_v3 - mettre à jour le profil utilisateur change le bilan', async () => {
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
    await kycRepository.loadDefinitions();
    // WHEN
    const rep = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      superficie: Superficie.superficie_150_et_plus,
    });
    expect(rep.status).toBe(200);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/last_v3',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet.impact_kg_annee).toEqual(
      11217.986711969339,
    );
  });

  it('GET /utilisateur/id/bilans/last - une réponse vide ne fait pas crasher le bilan carbone', async () => {
    // GIVEN
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [Feature.bilan_carbone_detail],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID.KYC006,
          id_cms: 3,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          reponse_complexe: undefined,
          reponse_simple: undefined,
          ngc_key: 'logement . âge',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      unlocked_features: unlocked,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/last_v3',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet.impact_kg_annee).toEqual(
      DEFAULT_TOTAL_KG,
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
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual('Computed OK = [1]');
    expect(response.body[1]).toEqual('Skipped = [0]');
    expect(response.body[2]).toEqual('Errors = [0]');

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });

    expect(stats.situation).toEqual({});
    expect(stats.total_g).toEqual(DEFAULT_TOTAL_G);
    expect(stats.transport_g).toEqual(DEFAULT_TRANSPORT_G);
    expect(stats.alimenation_g).toEqual(DEFAULT_ALIMENTATION_G);
  });
  it(`POST /utlilisateurs/compute_bilan_carbone bilan carbon utilisteur avec une reponse alimentationNGC`, async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: 'KYC_saison_frequence',
          id_cms: 21,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          reponse_complexe: [
            {
              label: 'Souvent',
              code: 'souvent',
              ngc_code: '"souvent"',
              selected: true,
            },
            {
              label: 'Jamais',
              code: 'jamais',
              ngc_code: '"bof"',
              selected: false,
            },
            {
              label: 'Parfois',
              code: 'parfois',
              ngc_code: '"burp"',
              selected: false,
            },
          ],
          tags: [],
          ngc_key: 'alimentation . de saison . consommation',
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
    await kycRepository.loadDefinitions();
    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_bilan_carbone');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual('Computed OK = [1]');
    expect(response.body[1]).toEqual('Skipped = [0]');
    expect(response.body[2]).toEqual('Errors = [0]');

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });

    expect(stats.situation).toEqual({
      'alimentation . de saison . consommation': '"souvent"',
    });
    expect(stats.total_g).toEqual(8863759);
    expect(stats.transport_g).toEqual(1958482);
    expect(stats.alimenation_g).toEqual(2302621);
  });

  it(`POST /utlilisateurs/compute_bilan_carbone bilan pas de calcul si le dernier calcul succède la dernière question maj`, async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: 'KYC_saison_frequence',
          id_cms: 21,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          last_update: new Date(1000),
          reponse_complexe: [
            {
              label: 'Souvent',
              code: 'souvent',
              ngc_code: '"souvent"',
              selected: true,
            },
            {
              label: 'Jamais',
              code: 'jamais',
              ngc_code: '"bof"',
              selected: false,
            },
            {
              label: 'Parfois',
              code: 'parfois',
              ngc_code: '"burp"',
              selected: false,
            },
          ],
          tags: [],
          ngc_key: 'alimentation . de saison . consommation',
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

    await TestUtil.prisma.bilanCarboneStatistique.create({
      data: {
        utilisateurId: 'utilisateur-id',
        alimenation_g: 0,
        transport_g: 0,
        total_g: 0,
        situation: {},
        created_at: new Date(100),
        updated_at: new Date(2000),
      },
    });

    TestUtil.token = process.env.CRON_API_KEY;
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_bilan_carbone');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual('Computed OK = [0]');
    expect(response.body[1]).toEqual('Skipped = [1]');
    expect(response.body[2]).toEqual('Errors = [0]');

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });

    expect(stats.situation).toEqual({});
    expect(stats.total_g).toEqual(0);
    expect(stats.transport_g).toEqual(0);
    expect(stats.alimenation_g).toEqual(0);
    expect(stats.updated_at).toEqual(new Date(2000));
  });

  it(`POST /utlilisateurs/compute_bilan_carbone bilan carbon utilisteur une erreur pour un des utilisateurs`, async () => {
    // GIVEN
    const kyc_bad: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: 'KYC alcool_bad',
          id_cms: 1,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: true,
          reponse_simple: {
            value: '10',
          },
          reponse_complexe: undefined,
          tags: [],
          ngc_key: 'alimentation . boisson . alcool . litres',
        },
      ],
    };
    const kyc_ok: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: 'KYC alcool_good',
          id_cms: 2,
          type: TypeReponseQuestionKYC.entier,
          is_NGC: true,
          reponse_simple: {
            value: '5',
          },
          reponse_complexe: undefined,
          tags: [],
          ngc_key: 'alimentation . boisson . alcool . litres',
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC alcool_bad',
      id_cms: 1,
      question: `Combien de litres ^^`,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.mission,
      points: 10,
      reponses: [],
      tags: [],
      ngc_key: 'very bad key',
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

    await TestUtil.create(DB.kYC, {
      code: 'KYC alcool_good',
      id_cms: 2,
      question: `Combien de litres ^^`,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.mission,
      points: 10,
      reponses: [],
      tags: [],
      ngc_key: 'alimentation . boisson . alcool . litres',
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

    await TestUtil.create(DB.utilisateur, { kyc: kyc_bad });
    await TestUtil.create(DB.utilisateur, { id: '2', email: '2', kyc: kyc_ok });

    TestUtil.token = process.env.CRON_API_KEY;

    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_bilan_carbone');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(4);
    expect(response.body[0]).toEqual('Computed OK = [1]');
    expect(response.body[1]).toEqual('Skipped = [0]');
    expect(response.body[2]).toEqual('Errors = [1]');

    expect(response.body[3]).toEqual(
      'BC KO [utilisateur-id] : {"name":"SituationError","info":{"dottedName":"very bad key"}}',
    );

    const stats = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: '2',
      },
    });

    expect(stats.situation).toEqual({
      'alimentation . boisson . alcool . litres': 5,
    });
    expect(stats.total_g).toEqual(9135085);

    const stats2 = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: {
        utilisateurId: 'utilisateur-id',
      },
    });
    expect(stats2).toBeNull();
  });

  it('GET /utilisateurs/id/bilans/total - renvoie le total et écrit dans la base de stats', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/total',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.impact_kg_annee).toEqual(DEFAULT_TOTAL_KG);

    const statsDB = await TestUtil.prisma.bilanCarboneStatistique.findUnique({
      where: { utilisateurId: 'utilisateur-id' },
    });

    expect(statsDB.total_g).toEqual(8900305);
  });
  it('GET /utilisateurs/id/bilans/total - ne recalcul pas et utilise la dernière valeur dans la table de stats', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    await TestUtil.prisma.bilanCarboneStatistique.create({
      data: {
        total_g: 123,
        utilisateurId: 'utilisateur-id',
        situation: {},
        transport_g: 0,
        alimenation_g: 0,
        updated_at: new Date(),
      },
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/total',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.impact_kg_annee).toEqual(0.123);
  });

  it('GET /utilisateurs/id/bilans/total - recalcul car la valeur de stats est trop vieille', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    await TestUtil.prisma.bilanCarboneStatistique.create({
      data: {
        total_g: 123,
        utilisateurId: 'utilisateur-id',
        situation: {},
        transport_g: 0,
        alimenation_g: 0,
        updated_at: new Date(-1),
      },
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/total',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.impact_kg_annee).toEqual(DEFAULT_TOTAL_KG);
  });
});
