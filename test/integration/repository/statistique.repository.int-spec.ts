import { TestUtil } from '../../TestUtil';
import { StatistiqueRepository } from '../../../src/infrastructure/repository/statitstique.repository';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';

describe('StatistiqueRepository', () => {
  const OLD_ENV = process.env;
  const statistiqueRepository = new StatistiqueRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it("upsertStatistiquesDUnUtilisateur : créer ou modifie les statistiques d'un utilisateur", async () => {
    // WHEN
    await statistiqueRepository.upsertStatistiquesDUnUtilisateur(
      'idUtilisateur',
      2,
      3,
      2,
      1,
      ThematiqueUnivers.cereales,
      null,
    );

    // THEN
    const statistique = await TestUtil.prisma.statistique.findUnique({
      where: { utilisateurId: 'idUtilisateur' },
    });
    expect(statistique.nombre_defis_en_cours).toEqual(2);
    expect(statistique.nombre_defis_realises).toEqual(3);
    expect(statistique.nombre_defis_abandonnes).toEqual(2);
    expect(statistique.nombre_defis_pas_envie).toEqual(1);
    expect(statistique.thematiques_en_cours).toBeNull();
    expect(statistique.thematiques_terminees).toEqual(
      ThematiqueUnivers.cereales,
    );
  });
});
