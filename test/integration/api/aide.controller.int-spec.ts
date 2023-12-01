import { TestUtil } from '../../TestUtil';

describe('Aide (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /utilisateurs/:utilisateurId/simulerAideVelo ok', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 1000,
    });

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.cargo[0].libelle).toEqual('Bonus vélo');
  });
});
