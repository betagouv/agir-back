import { StatistiqueExternalRepository } from '../../../src/infrastructure/repository/statitstique.external.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DuplicateUsecase } from '../../../src/usecase/stats/new/duplicate.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('Duplicate Usecase', () => {
  let statistiqueExternalRepository = new StatistiqueExternalRepository(
    TestUtil.prisma_stats,
  );
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  let duplicateUsecase = new DuplicateUsecase(
    utilisateurRepository,
    statistiqueExternalRepository,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('duplicateUtilisateur : copy ok si moins de user que block size', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      external_stat_id: '123',
      code_commune: '456',
      derniere_activite: new Date(1),
    });

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(5);

    // THEN
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(stats_users).toHaveLength(1);

    const user = stats_users[0];
    expect(user.nombre_parts_fiscales.toNumber()).toEqual(2);
    delete user.nombre_parts_fiscales;

    expect(user).toEqual({
      code_insee_commune: '456',
      code_postal: '91120',
      compte_actif: true,
      date_derniere_activite: new Date(1),
      id: '123',
      nom_commune: 'PALAISEAU',
      nombre_points: 10,
      revenu_fiscal: 10000,
      source_inscription: 'web',
    });
  });

  it(`duplicateUtilisateur : copy ok si plus d'utilisateuts que block size`, async () => {
    // GIVEN
    for (let index = 0; index < 10; index++) {
      await TestUtil.create(DB.utilisateur, {
        id: 'id_' + index,
        external_stat_id: 'stat_id_' + index,
        code_commune: '456',
        email: 'email_' + index,
      });
    }

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(7);

    // THEN
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(stats_users).toHaveLength(10);
  });
  it(`duplicateUtilisateur : genere un id externe si nécessaire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      external_stat_id: null,
    });

    // WHEN
    await duplicateUsecase.duplicateUtilisateur(5);

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findMany();
    const stats_users = await TestUtil.prisma_stats.utilisateurCopy.findMany();

    expect(userDB[0].external_stat_id).not.toBeNull();
    expect(userDB[0].external_stat_id.length).toBeGreaterThan(20);
    expect(stats_users[0].id).toEqual(userDB[0].external_stat_id);
  });
});
