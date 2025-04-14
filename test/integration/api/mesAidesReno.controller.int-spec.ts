import {
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Mes Aides Reno (API test)', () => {
  const OLD_ENV = process.env;
  const kycRepository = new KycRepository(TestUtil.prisma);

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
      'https://mesaidesreno.beta.gouv.fr/simulation?iframe=true&DPE.actuel=2&logement.p%C3%A9riode+de+construction=%22au+moins+15+ans%22&logement.propri%C3%A9taire+occupant=oui&vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui&logement.type=%22appartement%22&m%C3%A9nage.personnes=2&m%C3%A9nage.revenu=20000&m%C3%A9nage.commune=%2231555%22&m%C3%A9nage.code+r%C3%A9gion=%2276%22&m%C3%A9nage.code+d%C3%A9partement=%2231%22&m%C3%A9nage.EPCI=%22243100518%22&logement.commune=%2231555%22&logement.commune+d%C3%A9partement=%2231%22&logement.commune+r%C3%A9gion=%2276%22&logement.commune.nom=%22Toulouse%22&logement.code+postal=%2231500%22',
    );
  });

  test('POST /utilisateurs/:utilisateurId/mes_aides_reno/nouvelle_situation', async () => {
    await TestUtil.create(DB.utilisateur, {
      logement: {
        proprietaire: true,
        plus_de_15_ans: true,
        dpe: 'B',
        type: TypeLogement.appartement,
        nombre_adultes: 2,
        commune: 'TOULOUSE',
        code_postal: '31500',
        superficie: Superficie.superficie_150_et_plus,
      },
      revenu_fiscal: 20000,
    });
    await TestUtil.createKYCLogement();
    await kycRepository.loadCache();

    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/mes_aides_reno/nouvelle_situation',
    ).send({
      situation: {
        'vous . propriétaire . statut': '"propriétaire"',
        'logement . propriétaire occupant': 'oui',
        'logement . résidence principale propriétaire': 'oui',
        'logement . type': '"maison"',
        'logement . surface': '30',
        'logement . période de construction': '"au moins 15 ans"',
        'ménage . personnes': '2',
        'ménage . code région': '"76"',
        'ménage . code département': '"31"',
        'ménage . EPCI': '"243100518"',
        'ménage . commune': '"31555"',
        'ménage . commune . nom': '"Toulouse"',
        'taxe foncière . commune . éligible . ménage': 'non',
        'logement . commune . denormandie': 'non',
        'ménage . revenu': '32197',
        'DPE . actuel': '3',
      },
    });
    expect(response.status).toBe(201);

    const response2 = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/logement',
    );
    expect(response2.status).toBe(200);
    expect(response2.body.type).toBe(TypeLogement.maison);
    expect(response2.body.superficie).toBe(Superficie.superficie_35);
    expect(response2.body.dpe).toBe(DPE.C);
    expect(response2.body.nombre_adultes).toBe(2);
  });
});
