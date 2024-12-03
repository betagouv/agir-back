import { KYCComplexValues, KYCID } from 'src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from 'src/domain/kyc/questionKYC';
import { AlternativeAPI } from 'src/infrastructure/api/types/simulateur_voiture/SimualteurVoitureResultatAPI';
import { KycRepository } from 'src/infrastructure/repository/kyc.repository';
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
      await kycRepository.loadDefinitions();

      // WHEN
      await setMotorisation('hybride');
      await setCarburant('essence_E85');
      await setGabarit('SUV');

      // THEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat/voiture_actuelle',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        couts: 5410.099744675109,
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
      await kycRepository.loadDefinitions();

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
      await kycRepository.loadDefinitions();

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
});

async function createKYCs() {
  // NOTE: this seems to be hacky, KYCs should already sync with the DB
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
}

// NOTE: should we move this to a more generic helper function in TestUtil?
async function setMotorisation(
  value: KYCComplexValues[KYCID.KYC_transport_voiture_motorisation]['code'],
) {
  await setKYC(
    KYCID.KYC_transport_voiture_motorisation,
    ['thermique', 'hybride', 'electrique'].map((code) => ({
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

async function setKYC(kyc: KYCID, values: object[]) {
  const resp = await TestUtil.PUT(
    `/utilisateurs/utilisateur-id/questionsKYC_v2/${kyc}`,
  ).send(values);
  expect(resp.status).toBe(200);
}
