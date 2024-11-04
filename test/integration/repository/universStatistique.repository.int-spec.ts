import { TestUtil } from '../../TestUtil';
import { ThematiqueStatistiqueRepository } from '../../../src/infrastructure/repository/universStatistique.repository';
import { Univers } from '../../../src/domain/univers/univers';

describe('UniversStatistiqueRepository', () => {
  const OLD_ENV = process.env;
  const universStatistiqueRepository = new ThematiqueStatistiqueRepository(
    TestUtil.prisma,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it("upsertUniversStatistiques  : créer ou modifie les statistiques d'un univers", async () => {
    // WHEN
    await universStatistiqueRepository.upsert(
      'idUnivers1',
      Univers.alimentation,
      0,
      3,
      2,
      4,
      0,
      6,
    );
    await universStatistiqueRepository.upsert(
      'idUnivers2',
      Univers.climat,
      1,
      0,
      2,
      4,
      5,
      6,
    );

    // THEN
    const universStatistique =
      await TestUtil.prisma.universStatistique.findMany({});
    const universStatistique1 =
      await TestUtil.prisma.universStatistique.findUnique({
        where: { universId: 'idUnivers1' },
      });
    const universStatistique2 =
      await TestUtil.prisma.universStatistique.findUnique({
        where: { universId: 'idUnivers2' },
      });

    delete universStatistique1.created_at;
    delete universStatistique1.updated_at;
    delete universStatistique2.created_at;
    delete universStatistique2.updated_at;

    expect(universStatistique).toHaveLength(2);
    expect(universStatistique1).toStrictEqual({
      universId: 'idUnivers1',
      titre: Univers.alimentation,
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 3,
      completion_pourcentage_41_60: 2,
      completion_pourcentage_61_80: 4,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 6,
    });
    expect(universStatistique2).toStrictEqual({
      universId: 'idUnivers2',
      titre: Univers.climat,
      completion_pourcentage_1_20: 1,
      completion_pourcentage_21_40: 0,
      completion_pourcentage_41_60: 2,
      completion_pourcentage_61_80: 4,
      completion_pourcentage_81_99: 5,
      completion_pourcentage_100: 6,
    });

    await universStatistiqueRepository.upsert(
      'idUnivers1',
      Univers.alimentation,
      1,
      4,
      2,
      4,
      6,
      6,
    );

    const universStatistiqueApresUpsert =
      await TestUtil.prisma.universStatistique.findMany({});
    const universStatistique1ApresUpsert =
      await TestUtil.prisma.universStatistique.findUnique({
        where: { universId: 'idUnivers1' },
      });

    delete universStatistique1ApresUpsert.updated_at;
    delete universStatistique1ApresUpsert.created_at;

    expect(universStatistiqueApresUpsert).toHaveLength(2);
    expect(universStatistique1ApresUpsert).toStrictEqual({
      universId: 'idUnivers1',
      titre: Univers.alimentation,
      completion_pourcentage_1_20: 1,
      completion_pourcentage_21_40: 4,
      completion_pourcentage_41_60: 2,
      completion_pourcentage_61_80: 4,
      completion_pourcentage_81_99: 6,
      completion_pourcentage_100: 6,
    });
  });
});
