import { KYCID } from 'src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from 'src/domain/kyc/questionKYC';
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

  describe('GET /utilisateurs/id/simulateur_voiture/resultat', () => {
    test('renvoie un résultat avec les valeur par défaut', async () => {
      // GIVEN
      await TestUtil.create(DB.utilisateur);

      // WHEN
      console.time('GET /utilisateurs/id/simulateur_voiture/resultat');
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat',
      );
      console.timeEnd('GET /utilisateurs/id/simulateur_voiture/resultat');

      // THEN
      expect(response.status).toBe(200);
      expect(response.body.voiture_actuelle).toEqual({
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
        question:
          "Quelle distance parcourez-vous à l'année en voiture ? (en km)",
        type: TypeReponseQuestionKYC.entier,
        is_ngc: true,
      });

      await TestUtil.create(DB.utilisateur);
      await kycRepository.loadDefinitions();

      // WHEN
      const resp = await TestUtil.PUT(
        `/utilisateurs/utilisateur-id/questionsKYC_v2/${KYCID.KYC_transport_voiture_motorisation}`,
      ).send([
        {
          code: 'thermique',
          selected: false,
        },
        {
          code: 'hybride',
          selected: false,
        },
        {
          code: 'electrique',
          selected: true,
        },
      ]);
      expect(resp.status).toBe(200);

      // THEN
      const response = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat',
      );

      expect(response.status).toBe(200);
      expect(response.body.voiture_actuelle).toEqual({
        couts: 5236.6576469052225,
        empreinte: 940.8894928531117,
        gabarit: {
          label: 'Berline',
          valeur: 'berline',
        },
        motorisation: {
          label: 'Électrique',
          valeur: 'électrique',
        },
        carburant: undefined,
      });

      // WHEN (km = 0)
      const resp2 = await TestUtil.PUT(
        `/utilisateurs/utilisateur-id/questionsKYC_v2/${KYCID.KYC_transport_voiture_km}`,
      ).send([{ value: '0' }]);
      console.log(resp2.body);
      expect(resp2.status).toBe(200);

      const response2 = await TestUtil.GET(
        '/utilisateurs/utilisateur-id/simulateur_voiture/resultat',
      );
      expect(response2.status).toBe(200);
      expect(response2.body.voiture_actuelle.empreinte).toEqual(0);
      expect(response2.body.voiture_actuelle.motorisation.valeur).toEqual(
        'électrique',
      );
    });
  });
});
