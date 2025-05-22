import ngcRules from '@incubateur-ademe/nosgestesclimat/nosgestesclimat.model.json';
import { KYC } from '@prisma/client';
import { KYCS_TO_RULE_NAME } from 'src/domain/kyc/publicodesMapping';
import { App } from '../../../src/domain/app';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { Superficie } from '../../../src/domain/logement/logement';
import { CacheBilanCarbone_v0 } from '../../../src/domain/object_store/bilan/cacheBilanCarbone_v0';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { NGCCalculator } from '../../../src/infrastructure/ngc/NGCCalculator';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

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
  unite: { abreviation: 'kg' },
  emoji: '🔥',
  reponse_simple: undefined,
  thematique: Thematique.alimentation,
};

describe('/bilan (API test)', () => {
  const kycRepository = new KycRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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

    const cache: CacheBilanCarbone_v0 = {
      est_bilan_complet: true,
      forcer_calcul_stats: false,
      version: 0,
      alimentation_kg: 0,
      consommation_kg: 0,
      logement_kg: 0,
      total_kg: 0,
      transport_kg: 0,
      updated_at: new Date(),
    };
    await TestUtil.create(DB.utilisateur, {
      cache_bilan_carbone: cache as any,
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
    await thematiqueRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/last_v3',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet).toEqual({
      impact_kg_annee: NGCCalculator.DEFAULT_TOTAL_KG,
      top_3: [
        {
          label: 'Voiture',
          pourcentage: 18,
          pourcentage_categorie: 80,
          impact_kg_annee: 1568.5480530854577,
          emoji: '🚘️',
        },
        {
          label: 'Services publics',
          pourcentage: 14,
          pourcentage_categorie: 87,
          impact_kg_annee: 1259.4428717769142,
          emoji: '🏛',
        },
        {
          label: 'Viandes',
          pourcentage: 14,
          pourcentage_categorie: 52,
          impact_kg_annee: 1207.648,
          emoji: '🥩',
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
          impact_kg_annee: NGCCalculator.DEFAULT_CONSOMMATION_KG,
          details: [
            {
              label: 'Textile',
              pourcentage: 4,
              pourcentage_categorie: 32,
              impact_kg_annee: 313.92953517652757,
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
              pourcentage_categorie: 13,
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
          unite: { abreviation: 'kg' },
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
          unite: { abreviation: 'kg' },
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
      unite: { abreviation: 'kg' },
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    const cache: CacheBilanCarbone_v0 = {
      est_bilan_complet: true,
      forcer_calcul_stats: false,
      version: 0,
      alimentation_kg: 0,
      consommation_kg: 0,
      logement_kg: 0,
      total_kg: 0,
      transport_kg: 0,
      updated_at: new Date(),
    };
    await TestUtil.create(DB.utilisateur, {
      cache_bilan_carbone: cache as any,
      kyc: kyc as any,
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
    await thematiqueRepository.loadCache();
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/last_v3?force=true',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.pourcentage_completion_totale).toEqual(17);
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
      impact_kg_annee: 8849.895108458928,
      top_3: [
        {
          label: 'Voiture',
          pourcentage: 18,
          pourcentage_categorie: 80,
          impact_kg_annee: 1568.5480530854577,
          emoji: '🚘️',
        },
        {
          label: 'Services publics',
          pourcentage: 14,
          pourcentage_categorie: 87,
          impact_kg_annee: 1259.4428717769142,
          emoji: '🏛',
        },
        {
          label: 'Viandes',
          pourcentage: 14,
          pourcentage_categorie: 52,
          impact_kg_annee: 1207.648,
          emoji: '🥩',
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
          impact_kg_annee: NGCCalculator.DEFAULT_CONSOMMATION_KG,
          details: [
            {
              label: 'Textile',
              pourcentage: 4,
              pourcentage_categorie: 32,
              impact_kg_annee: 313.92953517652757,
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
              pourcentage_categorie: 13,
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
    const cache: CacheBilanCarbone_v0 = {
      est_bilan_complet: true,
      forcer_calcul_stats: false,
      version: 0,
      alimentation_kg: 0,
      consommation_kg: 0,
      logement_kg: 0,
      total_kg: 0,
      transport_kg: 0,
      updated_at: new Date(),
    };
    await TestUtil.create(DB.utilisateur, {
      cache_bilan_carbone: cache as any,
    });
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
    await kycRepository.loadCache();
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
      11204.122798870005,
    );
  });

  it('GET /utilisateur/id/bilans/last - une réponse vide ne fait pas crasher le bilan carbone', async () => {
    // GIVEN
    const cache: CacheBilanCarbone_v0 = {
      est_bilan_complet: true,
      forcer_calcul_stats: false,
      version: 0,
      alimentation_kg: 0,
      consommation_kg: 0,
      logement_kg: 0,
      total_kg: 0,
      transport_kg: 0,
      updated_at: new Date(),
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
      kyc: kyc as any,
      cache_bilan_carbone: cache as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/last_v3',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.bilan_complet.impact_kg_annee).toEqual(
      NGCCalculator.DEFAULT_TOTAL_KG,
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

  it('GET /utilisateurs/id/bilans/total - renvoie le total et écrit dans la base de stats', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/total',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.impact_kg_annee).toEqual(
      NGCCalculator.DEFAULT_TOTAL_KG,
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.cache_bilan_carbone.total_kg).toEqual(
      NGCCalculator.DEFAULT_TOTAL_KG,
    );
    expect(userDB.cache_bilan_carbone.alimentation_kg).toEqual(
      NGCCalculator.DEFAULT_ALIMENTATION_KG,
    );
    expect(userDB.cache_bilan_carbone.transport_kg).toEqual(
      NGCCalculator.DEFAULT_TRANSPORT_KG,
    );
    expect(userDB.cache_bilan_carbone.logement_kg).toEqual(
      NGCCalculator.DEFAULT_LOGEMENT_KG,
    );
    expect(userDB.cache_bilan_carbone.consommation_kg).toEqual(
      NGCCalculator.DEFAULT_CONSOMMATION_KG,
    );

    expect(userDB.cache_bilan_carbone.updated_at.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
  it('GET /utilisateurs/id/bilans/total - ne recalcul pas et utilise la dernière valeur dans la table de stats', async () => {
    // GIVEN
    const cache_bilan_carbone: CacheBilanCarbone_v0 = {
      version: 0,
      alimentation_kg: 1,
      consommation_kg: 2,
      logement_kg: 3,
      total_kg: 6,
      transport_kg: 7,
      updated_at: new Date(),
      est_bilan_complet: true,
      forcer_calcul_stats: false,
    };
    await TestUtil.create(DB.utilisateur, {
      cache_bilan_carbone: cache_bilan_carbone as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/total',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.impact_kg_annee).toEqual(6);
  });

  it('GET /utilisateurs/id/bilans/total - recalcul car la valeur de stats est trop vieille', async () => {
    // GIVEN
    const cache_bilan_carbone: CacheBilanCarbone_v0 = {
      version: 0,
      alimentation_kg: 1,
      consommation_kg: 2,
      logement_kg: 3,
      total_kg: 6,
      transport_kg: 7,
      updated_at: new Date(-1),
      est_bilan_complet: true,
      forcer_calcul_stats: false,
    };
    await TestUtil.create(DB.utilisateur, {
      cache_bilan_carbone: cache_bilan_carbone as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/total',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.impact_kg_annee).toEqual(
      NGCCalculator.DEFAULT_TOTAL_KG,
    );
  });

  it('GET /utilisateurs/id/bilans/last_v3/code_thematique - bilan par thematique, data OK', async () => {
    // GIVEN
    const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

    await TestUtil.create(DB.utilisateur);

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.transport,
      titre: 'The Transport',
      image_url: 'aaaa',
    });
    await thematiqueRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/bilans/last_v3/transport',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      thematique: 'transport',
      impact_kg_annee: 1958.4824122240736,
      details: [
        {
          label: 'Voiture',
          impact_kg_annee: 1568.5480530854577,
          emoji: '🚘️',
        },
        { label: 'Avion', impact_kg_annee: 312.2395338291978, emoji: '✈️' },
        {
          label: 'Transports en commun',
          impact_kg_annee: 33.7904763482199,
          emoji: '🚌',
        },
        {
          label: '2 roues',
          impact_kg_annee: 23.196418035061875,
          emoji: '🛵',
        },
        { label: 'Ferry', impact_kg_annee: 11.88805068661542, emoji: '⛴' },
        { label: 'Train', impact_kg_annee: 8.8198802395209, emoji: '🚋' },
        { label: 'Mobilité douce', impact_kg_annee: 0, emoji: '🚲' },
        { label: 'Vacances', impact_kg_annee: 0, emoji: '🏖️' },
      ],
      emoji: '🚦',
    });
  });

  describe('GET /utilisateurs/utilisateur-id/bilans/last_v3', () => {
    it('should correctly compute the bilan according the NGC situation', async () => {
      await TestUtil.create(DB.utilisateur);
      await TestUtil.create(DB.kYC, {
        id_cms: 1,
        code: KYCID.KYC_transport_voiture_km,
        type: TypeReponseQuestionKYC.entier,
        is_ngc: true,
        question: `Km en voiture ?`,
        points: 10,
        categorie: Categorie.test,
        reponses: [],
        ngc_key:
          KYCS_TO_RULE_NAME[KYCID.KYC_transport_voiture_km]['nosgestesclimat'],
      });

      await kycRepository.loadCache();

      await TestUtil.create(DB.situationNGC, {
        utilisateurId: 'utilisateur-id',
        situation: {
          'transport . voiture . km': 200000,
        },
      });

      let last_res = await TestUtil.GET(
        `/utilisateurs/utilisateur-id/bilans/last_v3?force=true`,
      );

      expect(last_res.status).toBe(200);
      expect(last_res.body.bilan_complet.impact_kg_annee).toBeGreaterThan(
        NGCCalculator.DEFAULT_TOTAL_KG,
      );

      const question_res = await TestUtil.PUT(
        `/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_transport_voiture_km`,
      ).send([
        {
          value: ngcRules['transport . voiture . km']['par défaut'],
        },
      ]);

      expect(question_res.status).toBe(200);

      last_res = await TestUtil.GET(
        `/utilisateurs/utilisateur-id/bilans/last_v3?force=true`,
      );

      expect(last_res.status).toBe(200);
      expect(last_res.body.bilan_complet.impact_kg_annee).toEqual(
        NGCCalculator.DEFAULT_TOTAL_KG,
      );
    });
  });
});
