import { Pourcentile } from '../../../src/domain/gamification/board';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { UtilisateurBoardRepository } from '../../../src/infrastructure/repository/utilisateurBoard.repository';
import { DB, TestUtil } from '../../TestUtil';

const logement_palaiseau: Logement_v0 = {
  version: 0,
  superficie: Superficie.superficie_150,
  type: TypeLogement.maison,
  code_postal: '91120',
  chauffage: Chauffage.bois,
  dpe: DPE.B,
  nombre_adultes: 2,
  nombre_enfants: 2,
  plus_de_15_ans: true,
  proprietaire: true,
  latitude: 48,
  longitude: 2,
  numero_rue: '12',
  rue: 'avenue de la Paix',
  code_commune: '91477',
  score_risques_adresse: undefined,
  prm: undefined,
  est_prm_obsolete: false,
  est_prm_par_adresse: false,
  liste_adresses_recentes: [],
};

const logement_dijon: Logement_v0 = {
  version: 0,
  superficie: Superficie.superficie_150,
  type: TypeLogement.maison,
  code_postal: '21000',
  chauffage: Chauffage.bois,
  dpe: DPE.B,
  nombre_adultes: 2,
  nombre_enfants: 2,
  plus_de_15_ans: true,
  proprietaire: true,
  latitude: 48,
  longitude: 2,
  numero_rue: '12',
  rue: 'avenue de la Paix',
  code_commune: '21231',
  score_risques_adresse: undefined,
  prm: undefined,
  est_prm_obsolete: false,
  est_prm_par_adresse: false,
  liste_adresses_recentes: [],
};

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

  it(`top3 france: standard`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: 'user',
      email: '3',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 25,
      id: '4',
      email: '4',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 15,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
    });

    // WHEN
    const liste = await repo.top_trois_user('user');

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste).toEqual([
      {
        code_commune: '91477',
        points: 30,
        pseudo: 'pseudo',
        utilisateurId: 'user',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 25,
        pseudo: 'pseudo',
        utilisateurId: '4',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 20,
        pseudo: 'pseudo',
        utilisateurId: '2',
        rank: null,
        rank_commune: null,
      },
    ]);
  });
  it(`top3 france : user présent même si exclu`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: 'user',
      email: '3',
      est_valide_pour_classement: false,
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 25,
      id: '4',
      email: '4',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 15,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
    });

    // WHEN
    const liste = await repo.top_trois_user('user');

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste).toEqual([
      {
        code_commune: '91477',
        points: 30,
        pseudo: 'pseudo',
        utilisateurId: 'user',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 25,
        pseudo: 'pseudo',
        utilisateurId: '4',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 20,
        pseudo: 'pseudo',
        utilisateurId: '2',
        rank: null,
        rank_commune: null,
      },
    ]);
  });
  it(`top3 france : autre user exclu ok`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: 'user',
      email: '3',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 25,
      id: '4',
      email: '4',
      logement: logement_palaiseau as any,
      est_valide_pour_classement: false,
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 15,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
    });

    // WHEN
    const liste = await repo.top_trois_user('user');

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste).toEqual([
      {
        code_commune: '91477',
        points: 30,
        pseudo: 'pseudo',
        utilisateurId: 'user',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 20,
        pseudo: 'pseudo',
        utilisateurId: '2',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 15,
        pseudo: 'pseudo',
        utilisateurId: '5',
        rank: null,
        rank_commune: null,
      },
    ]);
  });

  it(`top3 local: standard`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: 'user',
      email: '3',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 25,
      id: '4',
      email: '4',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 15,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 100,
      id: '6',
      email: '6',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    // WHEN
    const liste = await repo.top_trois_commune_user('91477', 'user');

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste).toEqual([
      {
        code_commune: '91477',
        points: 30,
        pseudo: 'pseudo',
        utilisateurId: 'user',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 25,
        pseudo: 'pseudo',
        utilisateurId: '4',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 20,
        pseudo: 'pseudo',
        utilisateurId: '2',
        rank: null,
        rank_commune: null,
      },
    ]);
  });
  it(`top3 local : user présent même si exclu`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: 'user',
      email: '3',
      est_valide_pour_classement: false,
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 25,
      id: '4',
      email: '4',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 15,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 100,
      id: '6',
      email: '6',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    // WHEN
    const liste = await repo.top_trois_commune_user('91477', 'user');

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste).toEqual([
      {
        code_commune: '91477',
        points: 30,
        pseudo: 'pseudo',
        utilisateurId: 'user',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 25,
        pseudo: 'pseudo',
        utilisateurId: '4',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 20,
        pseudo: 'pseudo',
        utilisateurId: '2',
        rank: null,
        rank_commune: null,
      },
    ]);
  });
  it(`top3 local : autre user exclu ok`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: 'user',
      email: '3',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 25,
      id: '4',
      email: '4',
      est_valide_pour_classement: false,
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 15,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 100,
      id: '6',
      email: '6',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    // WHEN
    const liste = await repo.top_trois_commune_user('91477', 'user');

    // THEN
    expect(liste).toHaveLength(3);
    expect(liste).toEqual([
      {
        code_commune: '91477',
        points: 30,
        pseudo: 'pseudo',
        utilisateurId: 'user',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 20,
        pseudo: 'pseudo',
        utilisateurId: '2',
        rank: null,
        rank_commune: null,
      },
      {
        code_commune: '91477',
        points: 15,
        pseudo: 'pseudo',
        utilisateurId: '5',
        rank: null,
        rank_commune: null,
      },
    ]);
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
    );

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('utilisateur_classement_proximite_v2 : get empty when DB is empty', async () => {
    // GIVEN

    // WHEN
    const liste = await repo.utilisateur_classement_proximite_V2(
      100,
      10,
      'rank_avant_strict',
      'national',
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
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
      pseudo: 'toto',
    });
    await repo.update_rank_user_france();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      10,
      10,
      'rank_avant_strict',
      'national',
      undefined,
    );

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].utilisateurId).toEqual('1');
    expect(liste[0].code_commune).toEqual('91477');
    expect(liste[0].pseudo).toEqual('toto');
    expect(liste[0].points).toEqual(10);
    expect(liste[0].rank).toEqual(1);
  });

  it('utilisateur_classement_proximite_v2 : ligne unique ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
      pseudo: 'toto',
    });

    // WHEN
    const liste = await repo.utilisateur_classement_proximite_V2(
      9,
      10,
      'rank_avant_strict',
      'national',
      undefined,
      undefined,
    );

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].utilisateurId).toEqual('1');
    expect(liste[0].code_commune).toEqual('91477');
    expect(liste[0].pseudo).toEqual('toto');
    expect(liste[0].points).toEqual(10);
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
      '5',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[0].rank).toEqual(4);
    expect(liste[1].utilisateurId).toEqual('3');
    expect(liste[1].rank).toEqual(5);
  });

  it('utilisateur_classement_proximite_v2 : extract correct pour apres', async () => {
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
    const liste = await repo.utilisateur_classement_proximite_V2(
      50,
      2,
      'rank_apres_ou_egal',
      'national',
      undefined,
      '5',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[0].points).toEqual(40);
    expect(liste[1].utilisateurId).toEqual('3');
    expect(liste[1].points).toEqual(30);
  });

  it('utilisateur_classement_proximite : extract correct pour apres, ignore user non eligibles', async () => {
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
      '5',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[0].rank).toEqual(4);
    expect(liste[1].utilisateurId).toEqual('3');
    expect(liste[1].rank).toEqual(5);
  });

  it('utilisateur_classement_proximite_v2 : extract correct pour apres, ignore user non eligibles', async () => {
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

    // WHEN
    const liste = await repo.utilisateur_classement_proximite_V2(
      50,
      2,
      'rank_apres_ou_egal',
      'national',
      undefined,
      '5',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[1].utilisateurId).toEqual('3');
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
      '2',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[0].rank).toEqual(4);
    expect(liste[1].utilisateurId).toEqual('3');
    expect(liste[1].rank).toEqual(5);
  });

  it('utilisateur_classement_proximite_v2 : extract correct pour avant', async () => {
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
    const liste = await repo.utilisateur_classement_proximite_V2(
      20,
      2,
      'rank_avant_strict',
      'national',
      undefined,
      '2',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('4');
    expect(liste[1].utilisateurId).toEqual('3');
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
      ),
    ).toHaveLength(0);
  });

  it('utilisateur_classement_proximite_v2 : extract correct pour avant => liste vide si premier', async () => {
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

    // THEN
    expect(
      await repo.utilisateur_classement_proximite_V2(
        30,
        2,
        'rank_avant_strict',
        'national',
        undefined,
        '3',
      ),
    ).toHaveLength(0);

    // THEN
    expect(
      await repo.utilisateur_classement_proximite_V2(
        30,
        2,
        'rank_avant_strict',
        'national',
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
      ),
    ).toHaveLength(0);
  });

  it('utilisateur_classement_proximite-V2 : extract correct pour apres => liste vide si dernier', async () => {
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

    // THEN
    expect(
      await repo.utilisateur_classement_proximite_V2(
        20,
        2,
        'rank_apres_ou_egal',
        'national',
        undefined,
      ),
    ).toHaveLength(2);

    // THEN
    expect(
      await repo.utilisateur_classement_proximite_V2(
        10,
        2,
        'rank_apres_ou_egal',
        'national',
        undefined,
        '1',
      ),
    ).toHaveLength(0);
    // THEN
    expect(
      await repo.utilisateur_classement_proximite_V2(
        9,
        2,
        'rank_apres_ou_egal',
        'national',
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
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });

    await repo.update_rank_user_france();
    await repo.update_rank_user_commune();

    // WHEN
    const liste = await repo.utilisateur_classement_proximite(
      2,
      2,
      'rank_apres_ou_egal',
      'local',
      '21231',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('3');
    expect(liste[0].rank_commune).toEqual(2);
    expect(liste[1].utilisateurId).toEqual('2');
    expect(liste[1].rank_commune).toEqual(3);
  });

  it('utilisateur_classement_proximite_v2 : extract correct pour avant LOCAL', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });

    // WHEN
    const liste = await repo.utilisateur_classement_proximite_V2(
      20,
      2,
      'rank_apres_ou_egal',
      'local',
      '21231',
    );

    // THEN
    expect(liste).toHaveLength(2);
    expect(liste[0].utilisateurId).toEqual('2');
    expect(liste[1].utilisateurId).toEqual('1');
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

  it('update_rank_v2 : Caclul le rang', async () => {
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
    await repo.update_rank_user_france_V2();

    // THEN
    const db_list = await TestUtil.prisma.utilisateur.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    expect(db_list[0].rank).toEqual(1);
    expect(db_list[6].rank).toEqual(7);
  });

  it('update_rank_commune : Caclul le rang par commune', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    // WHEN
    await repo.update_rank_user_commune();

    // THEN
    let db_list = await TestUtil.prisma.utilisateur.findMany({
      where: {
        code_commune_classement: '91477',
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
        code_commune_classement: '21231',
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

  it('update_rank_commune_v2 : Caclul le rang par commune', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      points_classement: 10,
      id: '1',
      email: '1',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });

    // WHEN
    await repo.update_rank_user_commune_V2();

    // THEN
    let db_list = await TestUtil.prisma.utilisateur.findMany({
      where: {
        code_commune_classement: '91477',
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
        code_commune_classement: '21231',
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
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 20,
      id: '2',
      email: '2',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 30,
      id: '3',
      email: '3',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 40,
      id: '4',
      email: '4',
      logement: logement_dijon as any,
      code_commune_classement: '21231',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 50,
      id: '5',
      email: '5',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 60,
      id: '6',
      email: '6',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 70,
      id: '7',
      email: '7',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 80,
      id: '8',
      email: '8',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 90,
      id: '9',
      email: '9',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 100,
      id: '10',
      email: '10',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });
    await TestUtil.create(DB.utilisateur, {
      points_classement: 110,
      id: '11',
      email: '11',
      logement: logement_palaiseau as any,
      code_commune_classement: '91477',
    });

    // WHEN
    const result = await repo.getPourcentile(35, '21231');

    // THEN
    expect(result).toEqual(Pourcentile.pourcent_25);
  });
});
