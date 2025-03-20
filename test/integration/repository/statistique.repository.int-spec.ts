import { CodeMission } from '../../../src/domain/mission/codeMission';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { StatistiqueRepository } from '../../../src/infrastructure/repository/statitstique.repository';
import { TestUtil } from '../../TestUtil';

describe('StatistiqueRepository', () => {
  const OLD_ENV = process.env;
  const statistiqueRepository = new StatistiqueRepository(TestUtil.prisma);

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

  it("upsertStatistiquesDUnUtilisateur : créer ou modifie les statistiques d'un utilisateur", async () => {
    // WHEN
    await statistiqueRepository.upsertStatistiquesDUnUtilisateur(
      'idUtilisateur',
      2,
      3,
      2,
      1,
      CodeMission.cereales,
      null,
      `${Thematique.alimentation}, ${Thematique.consommation}`,
      null,
    );

    // THEN
    const statistique = await TestUtil.prisma.statistique.findUnique({
      where: { utilisateurId: 'idUtilisateur' },
    });

    delete statistique.created_at;
    delete statistique.updated_at;

    expect(statistique).toStrictEqual({
      utilisateurId: 'idUtilisateur',
      nombre_defis_en_cours: 2,
      nombre_defis_realises: 3,
      nombre_defis_abandonnes: 2,
      nombre_defis_pas_envie: 1,
      thematiques_en_cours: null,
      thematiques_terminees: CodeMission.cereales,
      univers_en_cours: null,
      univers_termines: `${Thematique.alimentation}, ${Thematique.consommation}`,
    });
  });
});
