import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { RisquesNaturelsCommunesRepository } from '../../../src/infrastructure/repository/risquesNaturelsCommunes.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Winter (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const risquesNaturelsCommunesRepository =
    new RisquesNaturelsCommunesRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
  });

  it('POST /utilisateurs/utilisateur-id/winter/inscription_par_adresse - service non actif', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/winter/inscription_par_adresse',
    ).send({
      nom: 'SMITH',
      adresse: '20 rue de la paix',
      code_postal: '91120',
      code_commune: '91477',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('le service winter est désactivé');
  });
  it('POST /utilisateurs/utilisateur-id/winter/inscription_par_adresse - service mode fake', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/winter/inscription_par_adresse',
    )
      .set('user-agent', `TheChrome`)
      .set('X-Forwarded-For', `MyIP`)
      .send({
        nom: 'SMITH',
        adresse: '20 rue de la paix',
        code_postal: '91120',
        code_commune: '91477',
      });

    // THEN
    expect(response.status).toBe(201);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(user.logement.prm).toEqual('12345678901234');
    const consent = (await TestUtil.prisma.linkyConsentement.findMany())[0];

    expect(consent.ip_address).toEqual('MyIP');
    expect(consent.email).toEqual('yo@truc.com');
    expect(consent.user_agent).toEqual('TheChrome');
  });
});
