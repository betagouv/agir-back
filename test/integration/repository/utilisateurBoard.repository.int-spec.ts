import { TestUtil } from '../../TestUtil';
import { UtilisateurBoardRepository } from '../../../src/infrastructure/repository/utilisateurBoard.repository';
import { Pourcetile } from '../../../src/infrastructure/api/types/gamification/boardAPI';

describe('UtilisateurBoardRepository', () => {
  let repo = new UtilisateurBoardRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('utilisateur_classement_proximite : get empty when DB is empty', async () => {
    // GIVEN

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      100,
      10,
      'avant',
      'national',
      undefined,
      undefined,
    );

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('utilisateur_classement_proximite : ligne unique ', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 10,
        utilisateurId: '1',
        code_postal: '91120',
        commune: 'PALAISEAU',
        prenom: 'toto',
      },
    });
    await repo.update_rank_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      10,
      10,
      'avant',
      'national',
      undefined,
      undefined,
    );

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].utilisateurId).toEqual('1');
    expect(liste[0].code_postal).toEqual('91120');
    expect(liste[0].commune).toEqual('PALAISEAU');
    expect(liste[0].prenom).toEqual('toto');
    expect(liste[0].points).toEqual(10);
    expect(liste[0].rank).toEqual(1);
  });

  it('utilisateur_classement_proximite : extract correct pour apres', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 60, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 70, utilisateurId: '7' },
    });
    await repo.update_rank_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      3,
      2,
      'apres',
      'national',
      undefined,
      undefined,
      '5',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[0].rank).toEqual(4);
    expect(liste[1].utilisateurId).toEqual('3');
    expect(liste[1].rank).toEqual(5);
  });

  it('utilisateur_classement_proximite : extract correct pour avant', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 60, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 70, utilisateurId: '7' },
    });

    await repo.update_rank_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      3,
      2,
      'avant',
      'national',
      undefined,
      undefined,
      '5',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('7');
    expect(liste[0].rank).toEqual(1);
    expect(liste[1].utilisateurId).toEqual('6');
    expect(liste[1].rank).toEqual(2);
  });
  it('utilisateur_classement_proximite : extract correct pour avant LOCAL', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 10,
        utilisateurId: '1',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 20,
        utilisateurId: '2',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 30,
        utilisateurId: '3',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 40,
        utilisateurId: '4',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 50,
        utilisateurId: '5',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 60,
        utilisateurId: '6',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 70,
        utilisateurId: '7',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });

    await repo.update_rank_france();
    await repo.update_rank_commune();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      2,
      2,
      'apres',
      'local',
      '21000',
      'DIJON',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('3');
    expect(liste[0].rank_commune).toEqual(2);
    expect(liste[1].utilisateurId).toEqual('2');
    expect(liste[1].rank_commune).toEqual(3);
  });

  it('update_rank : Caclul le rang', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '7' },
    });

    // WHEN
    await repo.update_rank_france();

    // THEN
    const db_list = await TestUtil.prisma.utilisateurBoard.findMany({
      orderBy: {
        utilisateurId: 'desc',
      },
    });

    expect(db_list[0].rank).toEqual(1);
    expect(db_list[1].rank).toEqual(2);
    expect(db_list[2].rank).toEqual(2);
    expect(db_list[3].rank).toEqual(3);
    expect(db_list[4].rank).toEqual(4);
    expect(db_list[5].rank).toEqual(4);
    expect(db_list[6].rank).toEqual(5);
  });

  it('update_rank_commune : Caclul le rang par commune', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 10,
        utilisateurId: '1',
        commune: 'PALAISEAU',
        code_postal: '91120',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 20,
        utilisateurId: '2',
        commune: 'PALAISEAU',
        code_postal: '91120',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 30,
        utilisateurId: '3',
        commune: 'PALAISEAU',
        code_postal: '91120',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 40,
        utilisateurId: '4',
        commune: 'DIJON',
        code_postal: '21000',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 50,
        utilisateurId: '5',
        commune: 'DIJON',
        code_postal: '21000',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 60,
        utilisateurId: '6',
        commune: 'DIJON',
        code_postal: '21000',
      },
    });

    // WHEN
    await repo.update_rank_commune();

    // THEN
    let db_list = await TestUtil.prisma.utilisateurBoard.findMany({
      where: {
        code_postal: '91120',
      },
      orderBy: {
        utilisateurId: 'desc',
      },
    });

    expect(db_list[0].rank_commune).toEqual(1);
    expect(db_list[0].utilisateurId).toEqual('3');
    expect(db_list[1].rank_commune).toEqual(2);
    expect(db_list[1].utilisateurId).toEqual('2');
    expect(db_list[2].rank_commune).toEqual(3);
    expect(db_list[2].utilisateurId).toEqual('1');

    db_list = await TestUtil.prisma.utilisateurBoard.findMany({
      where: {
        code_postal: '21000',
      },
      orderBy: {
        utilisateurId: 'desc',
      },
    });

    expect(db_list[0].rank_commune).toEqual(1);
    expect(db_list[0].utilisateurId).toEqual('6');
    expect(db_list[1].rank_commune).toEqual(2);
    expect(db_list[1].utilisateurId).toEqual('5');
    expect(db_list[2].rank_commune).toEqual(3);
    expect(db_list[2].utilisateurId).toEqual('4');
  });

  it('utilisateur_classement_proximite : extract correct pour apres même si un utilisateur sans rang', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 60, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 70, utilisateurId: '7' },
    });
    await repo.update_rank_france();

    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 80, utilisateurId: '8' },
    });

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      3,
      2,
      'apres',
      'national',
      undefined,
      undefined,
      '5',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[0].rank).toEqual(4);
    expect(liste[1].utilisateurId).toEqual('3');
    expect(liste[1].rank).toEqual(5);
  });

  it('getPourcentile : calcul correct national 50', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 60, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 70, utilisateurId: '7' },
    });

    // WHEN
    const result = await repo.getPourcentile(55);

    // THEN
    expect(result).toEqual(Pourcetile.pourcent_50);
  });

  it('getPourcentile : calcul correct national pas dans les 50 meilleurs ', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 60, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 70, utilisateurId: '7' },
    });

    // WHEN
    const result = await repo.getPourcentile(30);

    // THEN
    expect(result).toEqual(null);
  });

  it('getPourcentile : calcul correct national 25', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 60, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 70, utilisateurId: '7' },
    });

    // WHEN
    const result = await repo.getPourcentile(65);

    // THEN
    expect(result).toEqual(Pourcetile.pourcent_25);
  });

  it('getPourcentile : calcul correct national 10', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 10, utilisateurId: '1' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 20, utilisateurId: '2' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 30, utilisateurId: '3' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 40, utilisateurId: '4' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 50, utilisateurId: '5' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 60, utilisateurId: '6' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 70, utilisateurId: '7' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 80, utilisateurId: '8' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 90, utilisateurId: '9' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 100, utilisateurId: '10' },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: { points: 110, utilisateurId: '11' },
    });

    // WHEN
    const result = await repo.getPourcentile(105);

    // THEN
    expect(result).toEqual(Pourcetile.pourcent_10);
  });
  it('getPourcentile : calcul correct local 50', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 10,
        utilisateurId: '1',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 20,
        utilisateurId: '2',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 30,
        utilisateurId: '3',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 40,
        utilisateurId: '4',
        code_postal: '21000',
        commune: 'DIJON',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 50,
        utilisateurId: '5',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 60,
        utilisateurId: '6',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 70,
        utilisateurId: '7',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 80,
        utilisateurId: '8',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 90,
        utilisateurId: '9',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 100,
        utilisateurId: '10',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });
    await TestUtil.prisma.utilisateurBoard.create({
      data: {
        points: 110,
        utilisateurId: '11',
        code_postal: '91120',
        commune: 'PALAISEAU',
      },
    });

    // WHEN
    const result = await repo.getPourcentile(35, '21000', 'DIJON');

    // THEN
    expect(result).toEqual(Pourcetile.pourcent_25);
  });
});
