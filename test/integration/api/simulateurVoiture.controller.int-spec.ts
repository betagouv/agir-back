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

  it('GET /utilisateurs/id/simulateur_voiture/resultat - renvoie un résultat avec les valeur par défaut', async () => {
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
});
