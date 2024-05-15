import { DB, TestUtil } from '../../TestUtil';
import { Univers } from '../../../src/domain/univers/univers';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
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
      code: Univers.climat,
      label: 'yo',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
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
      type: Univers.climat,
      image_url: 'aaaa',
    });
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - liste les thematiques d'un univers`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.univers);
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.mobilite_quotidien,
      label: 'Bouger au quotidien',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.partir_vacances,
      label: 'Partir en vacances',
      image_url: 'bbbb',
    });
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/climat/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toEqual({
      titre: 'Bouger au quotidien',
      type: ThematiqueUnivers.mobilite_quotidien,
      progression: 0,
      cible_progression: 5,
      is_locked: false,
      reason_locked: null,
      is_new: true,
      niveau: 1,
      image_url: 'aaaa',
      univers_parent: 'climat',
      univers_parent_label: 'Le Climat !',
    });
    expect(response.body[1]).toEqual({
      titre: 'Partir en vacances',
      type: ThematiqueUnivers.partir_vacances,
      progression: 0,
      cible_progression: 5,
      is_locked: false,
      reason_locked: null,
      is_new: true,
      niveau: 1,
      image_url: 'bbbb',
      univers_parent: 'climat',
      univers_parent_label: 'Le Climat !',
    });
  });
  it(`GET /utilisateurs/id/univers/id/thematiques/climat/mission - renvoie la mission de la thématique en argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.univers);
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.mobilite_quotidien,
      label: 'Bouger au quotidien',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.partir_vacances,
      label: 'Partir en vacances',
      image_url: 'bbbb',
    });
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/climat/mission',
    );

    // THEN
    expect(response.status).toBe(200);
  });
});
