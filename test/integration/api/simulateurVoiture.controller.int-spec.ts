import { AlternativeAPI_v2 } from 'src/infrastructure/api/types/simulateur_voiture/SimulateurVoitureResultatAPI_v2';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { KYCComplexValues } from '../../../src/domain/kyc/publicodesMapping';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { AlternativeAPI } from '../../../src/infrastructure/api/types/simulateur_voiture/SimulateurVoitureResultatAPI';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/simulateur_voiture (API test)', () => {
  const kycRepository = new KycRepository(TestUtil.prisma);

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

  describe('GET /utilisateurs/id/simulateur_voiture/resultat/voiture_actuelle', () => {
    test('renvoie un résultat avec les valeur par défaut', async () => {
      // GIVEN
      await TestUtil.create(DB.utilisateur);

      // WHEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );

      // THEN
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        couts: 6370.257297587041,
        empreinte: 3022.851504292707,
        gabarit: {
          label: 'Berline',
          valeur: 'berline',
        },
        motorisation: {
          label: 'Thermique',
          valeur: 'thermique',
        },
        carburant: {
          label: 'Essence',
          valeur: 'essence E5 ou E10',
        },
      });
    });

    test('prend correctement en compte les KYCs', async () => {
      // GIVEN
      // NOTE: could only be done once for all tests?
      await createKYCs();
      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadCache();

      // WHEN
      await setMotorisation('hybride_non_rechargeable');
      await setCarburant('essence_E85');
      await setGabarit('SUV');
      await setVoitureOccasion(true);

      // THEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        couts: 4288.997957175108,
        empreinte: 1615.288885445806,
        gabarit: {
          label: 'SUV',
          valeur: 'SUV',
        },
        motorisation: {
          label: 'Hybride',
          valeur: 'hybride',
        },
        carburant: {
          // NOTE: do we want to map back to the KYC label?
          label: 'Essence (E85)',
          valeur: 'essence E85',
        },
      });

      // WHEN
      await setKmParcourus(0);

      const response2 = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );
      expect(response2.status).toBe(200);
      expect(response2.body.empreinte).toEqual(0);
      expect(response2.body.motorisation.valeur).toEqual('hybride');
    });

    test('prend correctement en compte les KYCs', async () => {
      // GIVEN
      // NOTE: could only be done once for all tests?
      await createKYCs();
      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadCache();

      // WHEN
      await setMotorisation('hybride_non_rechargeable');
      await setCarburant('essence_E85');
      await setGabarit('SUV');
      await setVoitureOccasion(true);

      // THEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        couts: 4288.997957175108,
        empreinte: 1615.288885445806,
        gabarit: {
          label: 'SUV',
          valeur: 'SUV',
        },
        motorisation: {
          label: 'Hybride',
          valeur: 'hybride',
        },
        carburant: {
          // NOTE: do we want to map back to the KYC label?
          label: 'Essence (E85)',
          valeur: 'essence E85',
        },
      });

      // WHEN
      await setKmParcourus(0);

      const response2 = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );
      expect(response2.status).toBe(200);
      expect(response2.body.empreinte).toEqual(0);
      expect(response2.body.motorisation.valeur).toEqual('hybride');
    });

    test('gère correctement les nouvelles motorisations', async () => {
      // GIVEN
      // NOTE: could only be done once for all tests?
      await createKYCs();
      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadCache();

      // WHEN
      await setMotorisation('hybride_non_rechargeable');
      await setCarburant('essence_E85');
      await setGabarit('SUV');
      await setVoitureOccasion(true);

      // THEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        couts: 4288.997957175108,
        empreinte: 1615.288885445806,
        gabarit: {
          label: 'SUV',
          valeur: 'SUV',
        },
        motorisation: {
          label: 'Hybride',
          valeur: 'hybride',
        },
        carburant: {
          // NOTE: do we want to map back to the KYC label?
          label: 'Essence (E85)',
          valeur: 'essence E85',
        },
      });
    });
  });

  describe('GET /utilisateurs/id/simulateur_voiture/resultat_v2/voiture_actuelle', () => {
    test('renvoie un résultat avec les valeur par défaut', async () => {
      // GIVEN
      await TestUtil.create(DB.utilisateur);

      // WHEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat_v2/voiture_actuelle',
      );

      // THEN
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        gabarit: { valeur: 'berline', label: 'Berline', est_applicable: true },
        motorisation: {
          valeur: 'thermique',
          label: 'Thermique',
          est_applicable: true,
        },
        carburant: {
          valeur: 'essence E5 ou E10',
          label: 'Essence',
          est_applicable: true,
        },
        couts: 5361.051382418858,
        empreinte: 4232.091181104764,
        est_occasion: false,
        params: [
          {
            id: 'voiture . thermique . consommation carburant',
            nom: 'Consommation carburant',
            valeur: '8,54',
            unite: 'l/100km',
          },
          {
            id: 'voiture . thermique . prix carburant',
            nom: 'Prix carburant',
            valeur: '1,65',
            unite: '€/l',
          },
          {
            id: 'coûts . coûts de possession . entretien',
            nom: 'Entretien',
            valeur: '1 250',
            unite: '€/an',
          },
          {
            id: 'coûts . coûts de possession . assurance',
            nom: 'Assurance',
            valeur: '640',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . stationnement",
            nom: 'Stationnement',
            valeur: '600',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . péage",
            nom: 'Péages',
            valeur: '721',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . contraventions",
            nom: 'Contraventions',
            valeur: '46',
            unite: '€/an',
          },
        ],
      });
    });

    test('prend correctement en compte les KYCs', async () => {
      // GIVEN
      // NOTE: could only be done once for all tests?
      await createKYCs();
      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadCache();

      // WHEN
      await setMotorisation('hybride_non_rechargeable');
      await setCarburant('essence_E85');
      await setGabarit('SUV');
      await setVoitureOccasion(true);

      // THEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat_v2/voiture_actuelle',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        gabarit: { valeur: 'SUV', label: 'SUV', est_applicable: true },
        motorisation: {
          valeur: 'hybride',
          label: 'Hybride',
          est_applicable: true,
        },
        carburant: {
          valeur: 'essence E85',
          label: 'Essence (E85)',
          est_applicable: true,
        },
        couts: 3303.9428059958586,
        empreinte: 3436.3507857871646,
        est_occasion: true,
        params: [
          {
            id: 'voiture . électrique . consommation électricité',
            nom: 'Consommation électricité',
            valeur: '26,76',
            unite: 'kWh/100km',
          },
          {
            id: 'voiture . électrique . prix kWh',
            nom: 'Prix kWh',
            valeur: '0,19',
            unite: '€/kWh',
          },
          {
            id: 'voiture . thermique . prix carburant',
            nom: 'Prix carburant',
            valeur: '0,74',
            unite: '€/l',
          },
          {
            id: 'coûts . coûts de possession . entretien',
            nom: 'Entretien',
            valeur: '1 125',
            unite: '€/an',
          },
          {
            id: 'coûts . coûts de possession . assurance',
            nom: 'Assurance',
            valeur: '640',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . stationnement",
            nom: 'Stationnement',
            valeur: '600',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . péage",
            nom: 'Péages',
            valeur: '606',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . contraventions",
            nom: 'Contraventions',
            valeur: '46',
            unite: '€/an',
          },
        ],
      });

      // WHEN
      await setKmParcourus(0);

      const response2 = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat_v2/voiture_actuelle',
      );
      expect(response2.status).toBe(200);
      expect(response2.body.empreinte).toEqual(0);
      expect(response2.body.motorisation.valeur).toEqual('hybride');
    });

    test('ne prend pas en compte le bonus écologique pour la voiture actuelle', async () => {
      // GIVEN
      // NOTE: could only be done once for all tests?
      await createKYCs();
      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadCache();

      // WHEN
      await setMotorisation('hybride_non_rechargeable');
      await setCarburant('essence_E85');
      await setGabarit('SUV');
      await setVoitureOccasion(false);

      // THEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat_v2/voiture_actuelle',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        gabarit: { valeur: 'SUV', label: 'SUV', est_applicable: true },
        motorisation: {
          valeur: 'hybride',
          label: 'Hybride',
          est_applicable: true,
        },
        carburant: {
          valeur: 'essence E85',
          label: 'Essence (E85)',
          est_applicable: true,
        },
        couts: 3303.9428059958586,
        empreinte: 3436.3507857871646,
        est_occasion: false,
        params: [
          {
            id: 'voiture . électrique . consommation électricité',
            nom: 'Consommation électricité',
            valeur: '26,76',
            unite: 'kWh/100km',
          },
          {
            id: 'voiture . électrique . prix kWh',
            nom: 'Prix kWh',
            valeur: '0,19',
            unite: '€/kWh',
          },
          {
            id: 'voiture . thermique . prix carburant',
            nom: 'Prix carburant',
            valeur: '0,74',
            unite: '€/l',
          },
          {
            id: 'coûts . coûts de possession . entretien',
            nom: 'Entretien',
            valeur: '1 125',
            unite: '€/an',
          },
          {
            id: 'coûts . coûts de possession . assurance',
            nom: 'Assurance',
            valeur: '640',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . stationnement",
            nom: 'Stationnement',
            valeur: '600',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . péage",
            nom: 'Péages',
            valeur: '606',
            unite: '€/an',
          },
          {
            id: "coûts . coûts d'utilisation . contraventions",
            nom: 'Contraventions',
            valeur: '46',
            unite: '€/an',
          },
        ],
      });
    });
  });

  describe('GET /utilisateurs/id/simulateur_voiture/resultat/voiture_cible', () => {
    test('renvoie un résultat avec les valeur par défaut', async () => {
      // GIVEN
      await TestUtil.create(DB.utilisateur);

      // WHEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_cible',
      );

      // THEN
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        gabarit: {
          label: 'Berline',
          valeur: 'berline',
        },
        recharge: true,
      });
    });

    test('renvoie un résultat avec les valeur par défaut correspondant aux KYCs', async () => {
      // GIVEN
      await createKYCs();
      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadCache();

      // WHEN
      await setGabarit('VUL');

      // WHEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_cible',
      );

      // THEN
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        gabarit: {
          label: 'Véhicule utilitaire',
          valeur: 'VUL',
        },
        recharge: true,
      });
    });
  });

  describe('GET /utilisateurs/id/simulateur_voiture/resultat/alternatives', () => {
    test('renvoie un résultat cohérent avec les valeur par défaut', async () => {
      // GIVEN
      await TestUtil.create(DB.utilisateur);

      // WHEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/alternatives',
      );

      // THEN
      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(45);
      response.body.forEach((alternative: AlternativeAPI) => {
        expect(alternative.type).toEqual('voiture-individuelle');
        expect(alternative.couts).toBeGreaterThan(0);
        expect(alternative.empreinte).toBeGreaterThan(0);
      });
    });

    test('est correctement impacté par les KYCs', async () => {
      // GIVEN
      await createKYCs();
      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadCache();

      await setKmParcourus(0);

      // WHEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/alternatives',
      );

      // THEN
      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(45);
      response.body.forEach((alternative: AlternativeAPI) => {
        expect(alternative.type).toEqual('voiture-individuelle');
        expect(alternative.couts).toBeGreaterThan(0);
        expect(alternative.empreinte).toEqual(0);
      });

      // WHEN
      await setKmParcourus(10000);
      await setGabarit('moyenne');
      await setMotorisation('electrique');

      // THEN
      const voiture_actuelle = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );
      const response2 = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/alternatives',
      );

      expect(voiture_actuelle.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response2.body.length).toEqual(45);
      response2.body.forEach((alternative: AlternativeAPI) => {
        expect(alternative.type).toEqual('voiture-individuelle');
        expect(alternative.couts).toBeGreaterThan(0);
        // NOTE: maybe should not be in the controller integration test?
        expect(voiture_actuelle.body.empreinte).toBeGreaterThan(0);
        expect(alternative.empreinte).toBeGreaterThanOrEqual(
          voiture_actuelle.body.empreinte,
        );
      });
    });
  });

  describe('GET /utilisateurs/id/simulateur_voiture/resultat_v2/alternatives', () => {
    test('renvoie un résultat cohérent avec les valeur par défaut', async () => {
      // GIVEN
      await TestUtil.create(DB.utilisateur);

      // WHEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat_v2/alternatives',
      );

      // THEN
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(90);
      response.body.forEach((alternative: AlternativeAPI_v2) => {
        expect(alternative.type).toEqual('voiture-individuelle');
        expect(alternative.couts).toBeGreaterThan(0);
        expect(alternative.empreinte).toBeGreaterThan(0);
        expect(alternative.est_occasion).toBeDefined();
        expect(alternative.gabarit.valeur).toBeDefined();
        expect(alternative.gabarit.valeur).toBeTruthy();
        expect(alternative.motorisation.valeur).toBeDefined();
        expect(alternative.motorisation.est_applicable).toBeTruthy();
        if (alternative.motorisation.valeur !== 'électrique') {
          expect(alternative.carburant?.valeur).toBeDefined();
          expect(alternative.carburant?.est_applicable).toBeTruthy();
        } else {
          expect(alternative.carburant).toBeUndefined();
        }
        expect(alternative.diff_couts).toBeDefined();
        expect(alternative.diff_emissions).toBeDefined();
        expect(alternative.economies_totales.valeur).toEqual(
          alternative.diff_couts * 10,
        );
        expect(alternative.diff_emissions).toBeDefined();
        expect(alternative.montant_aides.est_applicable).toEqual(
          alternative.est_occasion === false &&
            alternative.motorisation.valeur !== 'thermique',
        );
        expect(alternative.valeur_revente_actuelle.valeur).toBeDefined();
      });
    });
  });
});

async function createKYCs() {
  // NOTE: this seems to be hacky, KYCs should already sync with the DB
  //
  await TestUtil.create(DB.kYC, {
    code: KYCID.KYC_transport_type_utilisateur,
    id_cms: 140,
    question:
      'Utilisez-vous majoritairement la même voiture pour vous déplacer ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_ngc: true,
    reponses: [
      {
        code: 'proprio',
        label: 'Oui, je suis propriétaire',
        ngc_code: "'proprio'",
        selected: false,
      },
      {
        code: 'pas_la_mienne',
        label: "Non, ce n'est pas la mienne",
        ngc_code: "'pas_la_mienne'",
        selected: false,
      },
      {
        code: 'change_souvent',
        label: 'Non, je change souvent de voiture',
        ngc_code: "'change_souvent'",
        selected: false,
      },
    ],
  });
  await TestUtil.create(DB.kYC, {
    code: KYCID.KYC_transport_voiture_prix_achat,
    id_cms: 146,
    type: TypeReponseQuestionKYC.entier,
    is_ngc: true,
    conditions: [
      [
        {
          id_kyc: 140,
          code_reponse: 'proprio',
        },
      ],
    ],
  });
  await TestUtil.create(DB.kYC, {
    code: KYCID.KYC_transport_voiture_motorisation,
    id_cms: 141,
    question: 'Quel type de voiture utilisez vous ?',
    type: TypeReponseQuestionKYC.choix_unique,
    is_ngc: true,
    reponses: [
      {
        label: 'Thermique',
        code: 'thermique',
        ngc_code: "'thermique'",
        selected: false,
      },
      {
        label: 'Hybride',
        code: 'hybride',
        ngc_code: "'hybride'",
        selected: false,
      },
      {
        label: 'Électrique',
        code: 'electrique',
        ngc_code: "'électrique'",
        selected: false,
      },
      {
        label: 'Hybride rechargeable',
        code: 'hybride_rechargeable',
        ngc_code: "'hybride rechargeable'",
        selected: false,
      },
      {
        label: 'Hybride non rechargeable',
        code: 'hybride_non_rechargeable',
        ngc_code: "'hybride non rechargeable'",
        selected: false,
      },
    ],
  });
  await TestUtil.create(DB.kYC, {
    code: KYCID.KYC_transport_voiture_km,
    id_cms: 142,
    type: TypeReponseQuestionKYC.entier,
    is_ngc: true,
  });
  await TestUtil.create(DB.kYC, {
    code: KYCID.KYC_transport_voiture_gabarit,
    id_cms: 143,
    type: TypeReponseQuestionKYC.choix_unique,
    is_ngc: true,
    reponses: [
      {
        code: 'petite',
        label: 'Petite',
        ngc_code: "'petite'",
        selected: false,
      },
      {
        code: 'moyenne',
        label: 'Moyenne',
        ngc_code: "'moyenne'",
        selected: false,
      },
      {
        code: 'berline',
        label: 'Berline',
        ngc_code: "'berline'",
        selected: false,
      },
      {
        code: 'SUV',
        label: 'SUV',
        ngc_code: "'SUV'",
        selected: false,
      },
      {
        code: 'VUL',
        label: 'VUL',
        ngc_code: "'VUL'",
        selected: false,
      },
    ],
  });
  await TestUtil.create(DB.kYC, {
    code: KYCID.KYC_transport_voiture_thermique_carburant,
    id_cms: 144,
    type: TypeReponseQuestionKYC.choix_unique,
    is_ngc: true,
    reponses: [
      {
        code: 'gazole_B7_B10',
        label: 'Gazole B7/B10',
        ngc_code: "'gazole B7 ou B10'",
        selected: false,
      },
      {
        code: 'essence_E5_E10',
        label: 'Essence E5/E10',
        ngc_code: "'essence E5 ou E10'",
        selected: false,
      },
      {
        code: 'essence_E85',
        label: 'Essence E85',
        ngc_code: "'essence E85'",
        selected: false,
      },
      {
        code: 'GPL',
        label: 'GPL',
        ngc_code: "'GPL'",
        selected: false,
      },
    ],
  });

  await TestUtil.create(DB.kYC, {
    code: KYCID.KYC_transport_voiture_occasion,
    id_cms: 145,
    type: TypeReponseQuestionKYC.choix_unique,
    is_ngc: false,
    reponses: [
      {
        code: 'oui',
        reponse: 'Oui',
        ngc_code: 'oui',
        selected: false,
      },
      {
        code: 'non',
        reponse: 'Non',
        ngc_code: 'non',
        selected: false,
      },
    ],
  });
}

// NOTE: should we move this to a more generic helper function in TestUtil?
async function setMotorisation(
  value: KYCComplexValues[KYCID.KYC_transport_voiture_motorisation]['code'],
) {
  await setKYC(
    KYCID.KYC_transport_voiture_motorisation,
    [
      'thermique',
      'hybride',
      'electrique',
      'hybride_non_rechargeable',
      'hybride_rechargeable',
    ].map((code) => ({
      code,
      selected: code === value,
    })),
  );
}

async function setCarburant(
  value: KYCComplexValues[KYCID.KYC_transport_voiture_thermique_carburant]['code'],
) {
  await setKYC(
    KYCID.KYC_transport_voiture_thermique_carburant,
    ['gazole_B7_B10', 'essence_E5_E10', 'essence_E85', 'GPL'].map((code) => ({
      code,
      selected: code === value,
    })),
  );
}

async function setGabarit(
  value: KYCComplexValues[KYCID.KYC_transport_voiture_gabarit]['code'],
) {
  await setKYC(
    KYCID.KYC_transport_voiture_gabarit,
    ['petite', 'moyenne', 'berline', 'SUV', 'VUL'].map((code) => ({
      code,
      selected: code === value,
    })),
  );
}

async function setKmParcourus(value: number) {
  await setKYC(KYCID.KYC_transport_voiture_km, [{ value: String(value) }]);
}

async function setEstProprietaire(value: boolean) {
  await setKYC(KYCID.KYC_transport_type_utilisateur, [
    { code: 'proprio', selected: value },
    { code: 'pas_la_mienne' },
    { code: 'change_souvent', selected: !value },
  ]);
}

async function setPrixAchat(value: number) {
  await setKYC(KYCID.KYC_transport_voiture_prix_achat, [
    { value: String(value) },
  ]);
}

async function setVoitureOccasion(value: boolean) {
  await setKYC(KYCID.KYC_transport_voiture_occasion, [
    { code: 'oui', value: 'oui', selected: value },
    { code: 'non', value: 'non', selected: !value },
  ]);
}

async function setKYC(kyc: KYCID, values: object[]) {
  const resp = await TestUtil.PUT(
    `/utilisateurs/utilisateur-id/questionsKYC_v2/${kyc}`,
  ).send(values);
  expect(resp.status).toBe(200);
}
