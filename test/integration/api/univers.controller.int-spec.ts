import { DB, TestUtil } from '../../TestUtil';
import { UniversType } from '../../../src/domain/univers/universType';

describe('Univers (API test)', () => {
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

  it(`GET /utilisateurs/id/univers - liste les univers de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(6);
    expect(response.body[0]).toEqual({
      etoiles: 5,
      is_locked: false,
      reason_locked: null,
      titre: 'Le climat',
      type: UniversType.climat,
    });
  });
});
