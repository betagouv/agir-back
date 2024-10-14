import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurBoardRepository } from '../../../src/infrastructure/repository/utilisateurBoard.repository';
import { Pourcentile } from '../../../src/domain/gamification/board';

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
      'rank_avant_strict',
      'national',
      undefined,
      undefined,
    );

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('utilisateur_classement_proximite : ligne unique ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
      prenom: 'toto',
    });
    await repo.update_rank_user_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      10,
      10,
      'rank_avant_strict',
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
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });

    await repo.update_rank_user_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      3,
      2,
      'rank_apres_ou_egal',
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
  it('utilisateur_classement_proximite : extract correct pour apres, ignore prenoms null', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 45,
      id: '45',
      email: '45',
      est_valide_pour_classement: false,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });

    await repo.update_rank_user_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      3,
      2,
      'rank_apres_ou_egal',
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
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });

    await repo.update_rank_user_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      6,
      2,
      'rank_avant_strict',
      'national',
      undefined,
      undefined,
      '2',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[0].rank).toEqual(4);
    expect(liste[1].utilisateurId).toEqual('3');
    expect(liste[1].rank).toEqual(5);
  });
  it('utilisateur_classement_proximite : extract correct pour avant => liste vide si premier', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });

    await repo.update_rank_user_france();

    // THEN
    expect(
      await repo.utilisateur_classement_proximite(
        1,
        2,
        'rank_avant_strict',
        'national',
        undefined,
        undefined,
        '3',
      ),
    ).toHaveLength(0);

    // THEN
    expect(
      await repo.utilisateur_classement_proximite(
        1,
        2,
        'rank_avant_strict',
        'national',
        undefined,
        undefined,
      ),
    ).toHaveLength(0);
  });
  it('utilisateur_classement_proximite : extract correct pour apres => liste vide si dernier', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });

    await repo.update_rank_user_france();

    // THEN
    expect(
      await repo.utilisateur_classement_proximite(
        3,
        2,
        'rank_apres_ou_egal',
        'national',
        undefined,
        undefined,
      ),
    ).toHaveLength(1);

    // THEN
    expect(
      await repo.utilisateur_classement_proximite(
        3,
        2,
        'rank_apres_ou_egal',
        'national',
        undefined,
        undefined,
        '1',
      ),
    ).toHaveLength(0);
    // THEN
    expect(
      await repo.utilisateur_classement_proximite(
        4,
        2,
        'rank_apres_ou_egal',
        'national',
        undefined,
        undefined,
      ),
    ).toHaveLength(0);
  });
  it('utilisateur_classement_proximite : extract correct pour avant LOCAL', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });

    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });

    await repo.update_rank_user_france();
    await repo.update_rank_user_commune();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      2,
      2,
      'rank_apres_ou_egal',
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
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '7',
      email: '7',
    });

    // WHEN
    await repo.update_rank_user_france();

    // THEN
    const db_list = await TestUtil.prisma.utilisateur.findMany({
      orderBy: {
        id: 'desc',
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
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });

    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });

    // WHEN
    await repo.update_rank_user_commune();

    // THEN
    let db_list = await TestUtil.prisma.utilisateur.findMany({
      where: {
        code_postal_classement: '91120',
      },
      orderBy: {
        id: 'desc',
      },
    });

    expect(db_list[0].rank_commune).toEqual(1);
    expect(db_list[0].id).toEqual('3');
    expect(db_list[1].rank_commune).toEqual(2);
    expect(db_list[1].id).toEqual('2');
    expect(db_list[2].rank_commune).toEqual(3);
    expect(db_list[2].id).toEqual('1');

    db_list = await TestUtil.prisma.utilisateur.findMany({
      where: {
        code_postal_classement: '21000',
      },
      orderBy: {
        id: 'desc',
      },
    });

    expect(db_list[0].rank_commune).toEqual(1);
    expect(db_list[0].id).toEqual('6');
    expect(db_list[1].rank_commune).toEqual(2);
    expect(db_list[1].id).toEqual('5');
    expect(db_list[2].rank_commune).toEqual(3);
    expect(db_list[2].id).toEqual('4');
  });
  it('utilisateur_classement_proximite : extract correct pour apres même si un utilisateur sans rang', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });
    await repo.update_rank_user_france();

    await TestUtil.create(DB.utilisateur, {
      points_classement: 80,
      id: '8',
      email: '8',
    });

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      3,
      2,
      'rank_apres_ou_egal',
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
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });

    // WHEN
    const result = await repo.getPourcentile(55);

    // THEN
    expect(result).toEqual(Pourcentile.pourcent_50);
  });

  it('getPourcentile : calcul correct national pas dans les 50 meilleurs ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });
    // WHEN
    const result = await repo.getPourcentile(30);

    // THEN
    expect(result).toEqual(null);
  });
  it('getPourcentile : calcul correct national 25', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });
    // WHEN
    const result = await repo.getPourcentile(65);

    // THEN
    expect(result).toEqual(Pourcentile.pourcent_25);
  });
  it('getPourcentile : calcul correct national 10', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 80,
      id: '8',
      email: '8',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 90,
      id: '9',
      email: '9',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 100,
      id: '10',
      email: '10',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 110,
      id: '11',
      email: '11',
    });

    // WHEN
    const result = await repo.getPourcentile(105);

    // THEN
    expect(result).toEqual(Pourcentile.pourcent_10);
  });

  it('getPourcentile : calcul correct local 50', async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 80,
      id: '8',
      email: '8',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 90,
      id: '9',
      email: '9',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 100,
      id: '10',
      email: '10',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 110,
      id: '11',
      email: '11',
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });

    // WHEN
    const result = await repo.getPourcentile(35, '21000', 'DIJON');

    // THEN
    expect(result).toEqual(Pourcentile.pourcent_25);
  });
});
