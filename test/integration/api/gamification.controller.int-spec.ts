import { Pourcentile } from '../../../src/domain/gamification/board';
import { TypeBadge } from '../../../src/domain/gamification/typeBadge';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

const logement_palaiseau: Logement_v0 = {
  version: 0,
  superficie: Superficie.superficie_150,
  type: TypeLogement.maison,
  code_postal: '91120',
  chauffage: Chauffage.bois,
  commune: 'PALAISEAU',
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
};

const logement_dijon: Logement_v0 = {
  version: 0,
  superficie: Superficie.superficie_150,
  type: TypeLogement.maison,
  code_postal: '21000',
  chauffage: Chauffage.bois,
  commune: 'DIJON',
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
};
describe('Gamification  (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/gamification retourne le nombre de points de l utilisateur ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/gamification',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.points).toEqual(10);
  });
  it('GET /utilisateurs/id/gamification retourne les badges ', async () => {
    // GIVEN
    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      popup_reset_vue: false,
      badges: [TypeBadge.pionnier],
    };
    await TestUtil.create(DB.utilisateur, {
      gamification: gamification as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/gamification',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.badges).toEqual([
      {
        description: 'Présent depuis les premiers jours',
        image_url: '/badge-pionnier.webp',
        titre: 'Pionnier',
        type: 'pionnier',
      },
    ]);
  });

  it(`GET /utilisateurs/id/classement/national retourne le top 3 France ok`, async () => {
    // GIVEN
    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      popup_reset_vue: false,
      badges: [TypeBadge.pionnier],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'yo',
      email: '1',
      points_classement: 10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'yi',
      email: '2',
      points_classement: 20,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'ya',
      email: '3',
      points_classement: 30,
      gamification: gamification as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/national',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.top_trois).toHaveLength(3);
    expect(response.body.top_trois[0]).toStrictEqual({
      points: 30,
      rank: 1,
      pseudo: 'ya',
      id: 'ceddc0d114c8db1dc4bde88f1e29231f',
    });
    expect(response.body.top_trois[2]).toStrictEqual({
      points: 10,
      rank: 3,
      pseudo: 'yo',
      id: 'c4ca4238a0b923820dcc509a6f75849b',
    });
    expect(response.body.badges).toEqual([
      {
        description: 'Présent depuis les premiers jours',
        image_url: '/badge-pionnier.webp',
        titre: 'Pionnier',
        type: 'pionnier',
      },
    ]);
  });

  it(`GET /utilisateurs/id/classement/national retourne le top 3 France ok même si contient un pseudo non valide, celui-ci est proprement exclu`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'yo',
      email: '1',
      points_classement: 10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'yi',
      email: '2',
      points_classement: 20,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'ya',
      email: '3',
      points_classement: 30,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: 'hip',
      email: '4',
      points_classement: 35,
      est_valide_pour_classement: false,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/national',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.top_trois).toHaveLength(3);
    expect(response.body.top_trois[0]).toStrictEqual({
      points: 30,
      rank: 1,
      pseudo: 'ya',
      id: 'ceddc0d114c8db1dc4bde88f1e29231f',
    });
    expect(response.body.top_trois[2]).toStrictEqual({
      points: 10,
      rank: 3,
      pseudo: 'yo',
      id: 'c4ca4238a0b923820dcc509a6f75849b',
    });
  });
  it(`GET /utilisateurs/id/classement/national retourne le top 3 France ok exclu utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'yop',
      email: '1',
      points_classement: 10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'yi',
      email: '2',
      points_classement: 20,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'ya',
      email: '3',
      points_classement: 30,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: 'insulte',
      email: '4',
      points_classement: 40,
      est_valide_pour_classement: false,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/national',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.top_trois).toHaveLength(3);
    expect(response.body.top_trois[0]).toStrictEqual({
      points: 30,
      rank: 1,
      pseudo: 'ya',
      id: 'ceddc0d114c8db1dc4bde88f1e29231f',
    });
  });

  it(`GET /utilisateurs/id/classement retourne le top 3 commune utilisateur ok, exclu autre utilisateur`, async () => {
    // GIVEN
    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      popup_reset_vue: false,
      badges: [TypeBadge.pionnier],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'palaiseau_1',
      email: '1',
      points_classement: 10,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'palaiseau_2',
      email: '2',
      points_classement: 20,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      pseudo: 'palaiseau_3',
      email: '3',
      points_classement: 30,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: 'dijon_1',
      email: '4',
      points_classement: 10,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '41',
      pseudo: 'dijon_11',
      email: '41',
      points_classement: 19,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'utilisateur',
      email: '5',
      points_classement: 20,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
      gamification: gamification as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '444',
      pseudo: 'insulter',
      email: '444',
      points_classement: 40,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
      est_valide_pour_classement: false,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '6',
      pseudo: 'dijon_6',
      email: '6',
      points_classement: 50,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '7',
      pseudo: 'dijon_7',
      email: '7',
      points_classement: 10,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/local',
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      top_trois: [
        {
          points: 50,
          rank: 1,
          pseudo: 'dijon_6',
          id: '1679091c5a880faf6fb5e6087eb1b2dc',
        },
        {
          points: 20,
          rank: 2,
          pseudo: 'utilisateur',
          id: 'ceddc0d114c8db1dc4bde88f1e29231f',
        },
        {
          points: 19,
          rank: 3,
          pseudo: 'dijon_11',
          id: '3416a75f4cea9109507cacd8e2f2aefc',
        },
      ],
      utilisateur: {
        points: 20,
        rank: 3,
        pseudo: 'utilisateur',
        id: 'ceddc0d114c8db1dc4bde88f1e29231f',
      },
      classement_utilisateur: [
        {
          points: 50,
          rank: 2,
          pseudo: 'dijon_6',
          id: '1679091c5a880faf6fb5e6087eb1b2dc',
        },
        {
          points: 20,
          rank: 3,
          pseudo: 'utilisateur',
          id: 'ceddc0d114c8db1dc4bde88f1e29231f',
        },
        {
          points: 19,
          rank: 4,
          pseudo: 'dijon_11',
          id: '3416a75f4cea9109507cacd8e2f2aefc',
        },
        {
          points: 10,
          rank: 5,
          pseudo: 'dijon_7',
          id: '8f14e45fceea167a5a36dedd4bea2543',
        },
        {
          points: 10,
          rank: 6,
          pseudo: 'dijon_1',
          id: 'a87ff679a2f3e71d9181a67b7542122c',
        },
      ],
      pourcentile: 'pourcent_25',
      code_postal: '21000',
      commune_label: 'Dijon',
      badges: [
        {
          description: 'Présent depuis les premiers jours',
          image_url: '/badge-pionnier.webp',
          titre: 'Pionnier',
          type: 'pionnier',
        },
      ],
    });
  });

  it(`GET /utilisateurs/id/classement/local pas d'erreur si localisation manquante`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'palaiseau_1',
      email: '1',
      points_classement: 10,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'palaiseau_2',
      email: '2',
      points_classement: 20,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      pseudo: 'palaiseau_3',
      email: '3',
      points_classement: 30,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: 'dijon_1',
      email: '4',
      points_classement: 10,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '41',
      pseudo: 'dijon_11',
      email: '41',
      points_classement: 19,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'utilisateur',
      email: '5',
      points_classement: 20,
      code_commune_classement: null,
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '444',
      pseudo: 'insulter',
      email: '444',
      points_classement: 40,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
      est_valide_pour_classement: false,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '6',
      pseudo: 'dijon_6',
      email: '6',
      points_classement: 50,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '7',
      pseudo: 'dijon_7',
      email: '7',
      points_classement: 10,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/local',
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      top_trois: null,
      utilisateur: {
        points: 20,
        rank: 1,
        pseudo: 'utilisateur',
        id: 'ceddc0d114c8db1dc4bde88f1e29231f',
      },
      classement_utilisateur: [
        {
          points: 20,
          rank: 1,
          pseudo: 'utilisateur',
          id: 'ceddc0d114c8db1dc4bde88f1e29231f',
        },
      ],
      code_postal: '21000',
      pourcentile: null,
      badges: [],
    });
  });

  it(`GET /utilisateurs/id/classement retourne le national utilisateur ok`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'palaiseau_1',
      email: '1',
      points_classement: 10,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'palaiseau_2',
      email: '2',
      points_classement: 20,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      pseudo: 'palaiseau_3',
      email: '3',
      points_classement: 30,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: 'dijon_1',
      email: '4',
      points_classement: 11,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'dijon_2',
      email: '5',
      points_classement: 21,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/national',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.utilisateur.rank).toEqual(2);
    expect(response.body.top_trois[0].pseudo).toEqual('palaiseau_3');
    expect(response.body.utilisateur).toEqual({
      points: 21,
      rank: 2,
      pseudo: 'dijon_2',
      id: 'ceddc0d114c8db1dc4bde88f1e29231f',
    });
    expect(response.body.classement_utilisateur[0].pseudo).toEqual(
      'palaiseau_3',
    );
    expect(response.body.classement_utilisateur[4].pseudo).toEqual(
      'palaiseau_1',
    );
    expect(response.body.pourcentile).toEqual(Pourcentile.pourcent_25);
    expect(response.body.code_postal).toEqual(null);
    expect(response.body.commune_label).toEqual(null);
  });

  it(`GET /utilisateurs/id/classement retourne le national avec ordre OK même si des utilisateurs ont le même nbre de points`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: '1',
      email: '1',
      points_classement: 10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '0',
      pseudo: '0',
      email: '0',
      points_classement: 10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: '2',
      email: '2',
      points_classement: 10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      pseudo: '3',
      email: '3',
      points_classement: 30,
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: '4',
      email: '4',
      points_classement: 30,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '5',
      pseudo: '5',
      email: '5',
      points_classement: 30,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '55',
      pseudo: '55',
      email: '55',
      points_classement: 35,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'utilisateur',
      email: '6',
      points_classement: 20,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/national',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.classement_utilisateur).toEqual([
      {
        points: 35,
        rank: 1,
        pseudo: '55',
        id: 'b53b3a3d6ab90ce0268229151c9bde11',
      },
      {
        points: 30,
        rank: 2,
        pseudo: '5',
        id: 'e4da3b7fbbce2345d7772b0674a318d5',
      },
      {
        points: 30,
        rank: 3,
        pseudo: '4',
        id: 'a87ff679a2f3e71d9181a67b7542122c',
      },
      {
        points: 30,
        rank: 4,
        pseudo: '3',
        id: 'eccbc87e4b5ce2fe28308fd9f2a7baf3',
      },
      {
        points: 20,
        rank: 5,
        pseudo: 'utilisateur',
        id: 'ceddc0d114c8db1dc4bde88f1e29231f',
      },
      {
        points: 10,
        rank: 6,
        pseudo: '2',
        id: 'c81e728d9d4c2f636f067f89cc14862c',
      },
      {
        points: 10,
        rank: 7,
        pseudo: '1',
        id: 'c4ca4238a0b923820dcc509a6f75849b',
      },
      {
        points: 10,
        rank: 8,
        pseudo: '0',
        id: 'cfcd208495d565ef66e7dff9f98764da',
      },
    ]);
  });

  it(`GET /utilisateurs/id/classement retourne le national utilisateur ok , si utilisateur exclu alors non exclu de son propre classement`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      pseudo: 'palaiseau_1',
      email: '1',
      points_classement: 10,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      pseudo: 'palaiseau_2',
      email: '2',
      points_classement: 20,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      pseudo: 'palaiseau_3',
      email: '3',
      points_classement: 30,
      code_commune_classement: '91477',
      logement: logement_palaiseau as any,
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      pseudo: 'dijon_1',
      email: '4',
      points_classement: 11,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      pseudo: 'insulte',
      email: '5',
      points_classement: 21,
      code_commune_classement: '21231',
      logement: logement_dijon as any,
      est_valide_pour_classement: false,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/national',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.utilisateur).toEqual({
      id: 'ceddc0d114c8db1dc4bde88f1e29231f',
      points: 21,
      pseudo: 'insulte',
      rank: 2,
    });
    expect(response.body.classement_utilisateur).toEqual([
      {
        id: 'eccbc87e4b5ce2fe28308fd9f2a7baf3',
        points: 30,
        pseudo: 'palaiseau_3',
        rank: 1,
      },
      {
        id: 'ceddc0d114c8db1dc4bde88f1e29231f',
        points: 21,
        pseudo: 'insulte',
        rank: 2,
      },
      {
        id: 'c81e728d9d4c2f636f067f89cc14862c',
        points: 20,
        pseudo: 'palaiseau_2',
        rank: 3,
      },
      {
        id: 'a87ff679a2f3e71d9181a67b7542122c',
        points: 11,
        pseudo: 'dijon_1',
        rank: 4,
      },
      {
        id: 'c4ca4238a0b923820dcc509a6f75849b',
        points: 10,
        pseudo: 'palaiseau_1',
        rank: 5,
      },
    ]);
  });

  it('POST /utilisateurs/id/gamification/popup_reset_vue indique que la popup de reset est vue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/gamification/popup_reset_vue',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.gamification.isPopupResetVue()).toEqual(true);
    expect(userDB.gamification.getPoints()).toEqual(210);
    expect(userDB.points_classement).toEqual(210);
    expect(userDB.gamification.getBadges()).toEqual([TypeBadge.pionnier]);
  });
});
