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

    expect(thematiquesStatistique).toHaveLength(2);
    expect(thematiqueStatistique1.titre).toEqual(ThematiqueUnivers.cereales);
    expect(thematiqueStatistique1.completion_pourcentage_1_20).toEqual(0);
    expect(thematiqueStatistique1.completion_pourcentage_21_40).toEqual(3);
    expect(thematiqueStatistique1.completion_pourcentage_41_60).toEqual(2);
    expect(thematiqueStatistique1.completion_pourcentage_61_80).toEqual(4);
    expect(thematiqueStatistique1.completion_pourcentage_81_99).toEqual(0);
    expect(thematiqueStatistique1.completion_pourcentage_100).toEqual(6);
    expect(thematiqueStatistique2.titre).toEqual(
      ThematiqueUnivers.dechets_compost,
    );
    expect(thematiqueStatistique2.completion_pourcentage_1_20).toEqual(1);
    expect(thematiqueStatistique2.completion_pourcentage_21_40).toEqual(0);
    expect(thematiqueStatistique2.completion_pourcentage_41_60).toEqual(2);
    expect(thematiqueStatistique2.completion_pourcentage_61_80).toEqual(4);
    expect(thematiqueStatistique2.completion_pourcentage_81_99).toEqual(5);
    expect(thematiqueStatistique2.completion_pourcentage_100).toEqual(6);

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

    expect(thematiquesStatistiqueApresUpsert).toHaveLength(2);
    expect(thematiqueStatistique1ApresUpsert.titre).toEqual(
      ThematiqueUnivers.cereales,
    );
    expect(
      thematiqueStatistique1ApresUpsert.completion_pourcentage_1_20,
    ).toEqual(1);
    expect(
      thematiqueStatistique1ApresUpsert.completion_pourcentage_21_40,
    ).toEqual(4);
    expect(
      thematiqueStatistique1ApresUpsert.completion_pourcentage_41_60,
    ).toEqual(2);
    expect(
      thematiqueStatistique1ApresUpsert.completion_pourcentage_61_80,
    ).toEqual(4);
    expect(
      thematiqueStatistique1ApresUpsert.completion_pourcentage_81_99,
    ).toEqual(6);
    expect(
      thematiqueStatistique1ApresUpsert.completion_pourcentage_100,
    ).toEqual(6);
  });
});
