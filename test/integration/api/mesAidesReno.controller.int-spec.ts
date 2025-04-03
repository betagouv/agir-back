import { TypeLogement } from 'src/domain/logement/logement';
import { DB, TestUtil } from '../../TestUtil';

describe('Mes Aides Reno (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  test('GET /utilisateurs/:utilisateurId/mes_aides_reno/iframe_url', async () => {
    await TestUtil.create(DB.utilisateur, {
      logement: {
        proprietaire: true,
        plus_de_15_ans: true,
        dpe: 'B',
        type: TypeLogement.appartement,
        nombre_adultes: 2,
        commune: 'TOULOUSE',
        code_postal: '31500',
      },
      revenu_fiscal: 20000,
    });

    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/mes_aides_reno/iframe_url',
    );

    expect(response.status).toBe(200);
    expect(response.text).toBe(
      'https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22&logement.propri%C3%A9taire+occupant=oui&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui&logement.p%C3%A9riode+de+construction=%22au+moins+15+ans%22&DPE.actuel=2&m%C3%A9nage.personnes=2&m%C3%A9nage.revenu=20000&logement.type=%22appartement%22&m%C3%A9nage.commune=%2231555%22&m%C3%A9nage.code+r%C3%A9gion=%2276%22&m%C3%A9nage.code+d%C3%A9partement=%2231%22&m%C3%A9nage.EPCI=%2231555%22&logement.commune=31555',
    );
  });
});
