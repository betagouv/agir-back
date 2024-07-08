import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { CelebrationType } from '../../../src/domain/gamification/celebrations/celebration';
import { EventType } from '../../../src/domain/appEvent';
import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Feature } from '../../../src/domain/gamification/feature';
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { UtilisateurBoardRepository } from '../../../src/infrastructure/repository/utilisateurBoard.repository';
import { GamificationUsecase } from '../../../src/usecase/gamification.usecase';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';

describe('Gamification  (API test)', () => {
  const utilisateurRepo = new UtilisateurRepository(TestUtil.prisma);
  const utilisateurBoardRepository = new UtilisateurBoardRepository(
    TestUtil.prisma,
  );
  const communeRepository = new CommuneRepository();

  const gamificationUsecase = new GamificationUsecase(
    utilisateurRepo,
    utilisateurBoardRepository,
    communeRepository,
  );

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
  it('GET /utilisateurs/id/gamification retourne le bon niveau et les bonnes bornes ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/gamification',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.niveau).toEqual(1);
    expect(response.body.current_points_in_niveau).toEqual(10);
    expect(response.body.point_target_in_niveau).toEqual(100);
  });
  it('GET /utilisateurs/id/gamification retourne la liste de celebrations ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/gamification',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.celebrations).toHaveLength(1);
    expect(response.body.celebrations[0]).toEqual({
      id: 'celebration-id',
      type: 'niveau',
      new_niveau: 2,
      titre: 'the titre',
      reveal: {
        id: 'reveal-id',
        feature: 'aides',
        titre: 'Les aides !',
        description: 'bla',
      },
    });
  });

  it(`GET /utilisateurs/id/classement retourne le top 3 France ok`, async () => {
    // GIVEN
    const gamification10: Gamification_v0 = {
      version: 0,
      points: 10,
      celebrations: [],
    };
    const gamification20: Gamification_v0 = {
      version: 0,
      points: 20,
      celebrations: [],
    };
    const gamification30: Gamification_v0 = {
      version: 0,
      points: 30,
      celebrations: [],
    };
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'yo',
      email: '1',
      gamification: gamification10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'yi',
      email: '2',
      gamification: gamification20,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      prenom: 'ya',
      email: '3',
      gamification: gamification30,
    });

    await gamificationUsecase.compute_classement();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.classement_national.top_trois).toHaveLength(3);
    expect(response.body.classement_national.top_trois[0]).toStrictEqual({
      points: 30,
      rank: 1,
      prenom: 'ya',
    });
    expect(response.body.classement_national.top_trois[2]).toStrictEqual({
      points: 10,
      rank: 3,
      prenom: 'yo',
    });
  });

  it(`GET /utilisateurs/id/classement retourne le top 3 commune utilisateur ok`, async () => {
    // GIVEN
    const gamification10: Gamification_v0 = {
      version: 0,
      points: 10,
      celebrations: [],
    };
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
    };
    const gamification20: Gamification_v0 = {
      version: 0,
      points: 20,
      celebrations: [],
    };
    const gamification30: Gamification_v0 = {
      version: 0,
      points: 30,
      celebrations: [],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'palaiseau_1',
      email: '1',
      gamification: gamification10,
      logement: logement_palaiseau,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'palaiseau_2',
      email: '2',
      gamification: gamification20,
      logement: logement_palaiseau,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      prenom: 'palaiseau_3',
      email: '3',
      gamification: gamification30,
      logement: logement_palaiseau,
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      prenom: 'dijon_1',
      email: '4',
      gamification: gamification10,
      logement: logement_dijon,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      prenom: 'dijon_2',
      email: '5',
      gamification: gamification20,
      logement: logement_dijon,
    });

    await gamificationUsecase.compute_classement();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.classement_national.utilisateur.rank).toEqual(2);
    expect(response.body.classement_local.utilisateur.rank).toEqual(1);
    expect(response.body).toStrictEqual({
      classement_local: {
        classement_utilisateur: [
          {
            points: 20,
            prenom: 'dijon_2',
            rank: 1,
          },
          {
            points: 10,
            prenom: 'dijon_1',
            rank: 2,
          },
        ],
        code_postal: '21000',
        commune_label: 'Dijon',
        pourcentile: 'pourcent_5',
        top_trois: [
          {
            points: 20,
            prenom: 'dijon_2',
            rank: 1,
          },
          {
            points: 10,
            prenom: 'dijon_1',
            rank: 2,
          },
        ],
        utilisateur: {
          points: 20,
          prenom: 'dijon_2',
          rank: 1,
        },
      },
      classement_national: {
        classement_utilisateur: [
          {
            points: 30,
            prenom: 'palaiseau_3',
            rank: 1,
          },
          {
            points: 20,
            prenom: 'dijon_2',
            rank: 2,
          },
          {
            points: 20,
            prenom: 'palaiseau_2',
            rank: 2,
          },
          {
            points: 10,
            prenom: 'dijon_1',
            rank: 3,
          },
          {
            points: 10,
            prenom: 'palaiseau_1',
            rank: 3,
          },
        ],
        pourcentile: 'pourcent_25',
        top_trois: [
          {
            points: 30,
            prenom: 'palaiseau_3',
            rank: 1,
          },
          {
            points: 20,
            prenom: 'dijon_2',
            rank: 2,
          },
          {
            points: 20,
            prenom: 'palaiseau_2',
            rank: 2,
          },
        ],
        utilisateur: {
          points: 20,
          prenom: 'dijon_2',
          rank: 2,
        },
      },
    });
  });

  it(`POST /utilisateurs/compute_classement recalcule le board classement de la france `, async () => {
    // GIVEN
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
    };
    const gamification10: Gamification_v0 = {
      version: 0,
      points: 10,
      celebrations: [],
    };
    const gamification20: Gamification_v0 = {
      version: 0,
      points: 20,
      celebrations: [],
    };
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'yo',
      email: '1',
      gamification: gamification10,
      logement: logement_palaiseau,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'yi',
      email: '2',
      gamification: gamification20,
      logement: logement_dijon,
    });
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/compute_classement');

    // THEN
    expect(response.status).toBe(201);

    const boardDB = await TestUtil.prisma.utilisateurBoard.findMany({
      orderBy: { points: 'desc' },
    });

    expect(boardDB).toHaveLength(2);
    delete boardDB[0].created_at;
    delete boardDB[0].updated_at;
    delete boardDB[1].created_at;
    delete boardDB[1].updated_at;
    expect(boardDB[0]).toStrictEqual({
      code_postal: '21000',
      commune: 'DIJON',
      points: 20,
      prenom: 'yi',
      utilisateurId: '2',
      rank: 1,
      rank_commune: 1,
    });
    expect(boardDB[1]).toStrictEqual({
      code_postal: '91120',
      commune: 'PALAISEAU',
      points: 10,
      prenom: 'yo',
      utilisateurId: '1',
      rank: 2,
      rank_commune: 1,
    });
  });

  it(`GET /utilisateurs/id/classement retourne le classement relatif de l'utilisateur national`, async () => {
    // GIVEN
    const gamification10: Gamification_v0 = {
      version: 0,
      points: 10,
      celebrations: [],
    };
    const gamification20: Gamification_v0 = {
      version: 0,
      points: 20,
      celebrations: [],
    };
    const gamification30: Gamification_v0 = {
      version: 0,
      points: 30,
      celebrations: [],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'yo',
      email: '1',
      gamification: gamification10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      prenom: 'yi',
      email: '2',
      gamification: gamification20,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      prenom: 'ya',
      email: '3',
      gamification: gamification30,
    });

    await gamificationUsecase.compute_classement();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.classement_national.utilisateur).toStrictEqual({
      points: 20,
      rank: 2,
      prenom: 'yi',
    });
    expect(
      response.body.classement_national.classement_utilisateur,
    ).toStrictEqual([
      {
        points: 30,
        rank: 1,
        prenom: 'ya',
      },
      {
        points: 20,
        rank: 2,
        prenom: 'yi',
      },
      {
        points: 10,
        rank: 3,
        prenom: 'yo',
      },
    ]);
  });

  it(`GET /utilisateurs/id/classement retourne le classement incomplet de l'utilisateur si la batch n'est pas encore passé sur lui`, async () => {
    // GIVEN
    const gamification10: Gamification_v0 = {
      version: 0,
      points: 10,
      celebrations: [],
    };
    const gamification20: Gamification_v0 = {
      version: 0,
      points: 20,
      celebrations: [],
    };
    const gamification30: Gamification_v0 = {
      version: 0,
      points: 30,
      celebrations: [],
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'yo',
      email: '1',
      gamification: gamification10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      prenom: 'ya',
      email: '3',
      gamification: gamification30,
    });

    await gamificationUsecase.compute_classement();

    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      prenom: 'yi',
      email: '2',
      gamification: gamification20,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.classement_national.top_trois).toHaveLength(2);
    expect(response.body.classement_national.top_trois[0]).toStrictEqual({
      points: 30,
      rank: 1,
      prenom: 'ya',
    });
    expect(response.body.classement_national.top_trois[1]).toStrictEqual({
      points: 10,
      rank: 2,
      prenom: 'yo',
    });
    expect(response.body.classement_national.utilisateur).toBeNull();
    expect(response.body.classement_national.classement_utilisateur).toBeNull();
  });
  /*
  it('Le passage d un niveau ajoute une célebration ', async () => {
    // GIVEN
    const gamification: Gamification_v0 = {
      version: 0,
      points: 95,
      celebrations: [],
    };
    await TestUtil.create(DB.utilisateur, { gamification });
    await TestUtil.create(DB.article, { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['celebrations']).toHaveLength(1);
    expect(dbUtilisateur.gamification['celebrations'][0].type).toEqual(
      CelebrationType.niveau,
    );
    //expect(dbUtilisateur.gamification['celebrations'][0].new_niveau).toEqual(2);
    expect(dbUtilisateur.gamification['celebrations'][0].reveal.titre).toEqual(
      'Vos aides',
    );
  });
  */
  /*
  it('Le passage du reveal des défis est inihiber si les défis sont déjà débloqués ', async () => {
    // GIVEN
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [Feature.defis],
    };

    const gamification: Gamification_v0 = {
      version: 0,
      points: 499,
      celebrations: [],
    };
    await TestUtil.create(DB.utilisateur, {
      gamification,
      unlocked_features: unlocked,
    });
    await TestUtil.create(DB.article, { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepo.getById('utilisateur-id');
    expect(userDB.gamification.celebrations[0].new_niveau).toEqual(6);
    expect(userDB.gamification.celebrations[0].reveal).toEqual(undefined);
  });
  */
  /*
  it('Le passage du reveal des défis reveal bien defis si pas encore activé ', async () => {
    // GIVEN
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [],
    };

    const gamification: Gamification_v0 = {
      version: 0,
      points: 499,
      celebrations: [],
    };
    await TestUtil.create(DB.utilisateur, {
      gamification,
      unlocked_features: unlocked,
    });
    await TestUtil.create(DB.article, { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepo.getById('utilisateur-id');
    //expect(userDB.gamification.celebrations[0].new_niveau).toEqual(6);
    expect(userDB.gamification.celebrations[0].reveal.feature).toEqual(
      Feature.defis,
    );
  });
  */
});
