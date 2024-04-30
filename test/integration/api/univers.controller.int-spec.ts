import { DB, TestUtil } from '../../TestUtil';
import { UniversType } from '../../../src/domain/univers/universType';
import { ThematiqueUniversType } from '../../../src/domain/univers/thematiqueUniversType';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';

describe('Univers (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

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
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: UniversType.climat,
      label: 'yo',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: UniversType.cuisine,
      label: 'ya',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toEqual({
      etoiles: 0,
      is_locked: false,
      reason_locked: null,
      titre: 'yo',
      type: UniversType.climat,
      image_url: 'aaaa',
    });
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - liste les thematiques d'un univers`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/cuisine/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
    expect(response.body[0]).toEqual({
      titre: 'Manger de saison',
      type: ThematiqueUniversType.manger_saison,
      progression: 0,
      cible_progression: 5,
      is_locked: false,
      reason_locked: null,
      is_new: true,
      niveau: 1,
    });
  });
});
