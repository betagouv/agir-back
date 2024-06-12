import { TestUtil } from '../../TestUtil';
import { ThematiqueStatistiqueRepository } from '../../../src/infrastructure/repository/thematiqueStatistique.repository';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';

describe('ThematiqueStatistiqueRepository', () => {
  const OLD_ENV = process.env;
  const thematiqueStatistiqueRepository = new ThematiqueStatistiqueRepository(
    TestUtil.prisma,
  );

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

  it("upsertThematiqueStatistiques  : créer ou modifie les statistiques d'une thématique", async () => {
    // WHEN
    await thematiqueStatistiqueRepository.upsertThematiqueStatistiques(
      'idThematique1',
      ThematiqueUnivers.cereales,
      0,
      3,
      2,
      4,
      0,
      6,
    );
    await thematiqueStatistiqueRepository.upsertThematiqueStatistiques(
      'idThematique2',
      ThematiqueUnivers.dechets_compost,
      1,
      0,
      2,
      4,
      5,
      6,
    );

    // THEN
    const thematiquesStatistique =
      await TestUtil.prisma.thematiqueStatistique.findMany({});
    const thematiqueStatistique1 =
      await TestUtil.prisma.thematiqueStatistique.findUnique({
        where: { thematiqueId: 'idThematique1' },
      });
    const thematiqueStatistique2 =
      await TestUtil.prisma.thematiqueStatistique.findUnique({
        where: { thematiqueId: 'idThematique2' },
      });

    delete thematiqueStatistique1.created_at;
    delete thematiqueStatistique1.updated_at;
    delete thematiqueStatistique2.created_at;
    delete thematiqueStatistique2.updated_at;

    expect(thematiquesStatistique).toHaveLength(2);
    expect(thematiqueStatistique1).toStrictEqual({
      thematiqueId: 'idThematique1',
      titre: ThematiqueUnivers.cereales,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 3,
      completion_pourcentage_41_60: 2,
      completion_pourcentage_61_80: 4,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 6,
    });
    expect(thematiqueStatistique2).toStrictEqual({
      thematiqueId: 'idThematique2',
      titre: ThematiqueUnivers.dechets_compost,
      completion_pourcentage_1_20: 1,
      completion_pourcentage_21_40: 0,
      completion_pourcentage_41_60: 2,
      completion_pourcentage_61_80: 4,
      completion_pourcentage_81_99: 5,
      completion_pourcentage_100: 6,
    });

    await thematiqueStatistiqueRepository.upsertThematiqueStatistiques(
      'idThematique1',
      ThematiqueUnivers.cereales,
      1,
      4,
      2,
      4,
      6,
      6,
    );

    const thematiquesStatistiqueApresUpsert =
      await TestUtil.prisma.thematiqueStatistique.findMany({});
    const thematiqueStatistique1ApresUpsert =
      await TestUtil.prisma.thematiqueStatistique.findUnique({
        where: { thematiqueId: 'idThematique1' },
      });

    delete thematiqueStatistique1ApresUpsert.updated_at;
    delete thematiqueStatistique1ApresUpsert.created_at;

    expect(thematiquesStatistiqueApresUpsert).toHaveLength(2);
    expect(thematiqueStatistique1ApresUpsert).toStrictEqual({
      thematiqueId: 'idThematique1',
      titre: ThematiqueUnivers.cereales,
      completion_pourcentage_1_20: 1,
      completion_pourcentage_21_40: 4,
      completion_pourcentage_41_60: 2,
      completion_pourcentage_61_80: 4,
      completion_pourcentage_81_99: 6,
      completion_pourcentage_100: 6,
    });
  });
});
