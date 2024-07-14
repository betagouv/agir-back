import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
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
import { Personnalisator } from '../../../src/infrastructure/personnalisation/personnalisator';
import { Pourcentile } from '../../../src/domain/gamification/board';

describe('Gamification  (API test)', () => {
  const utilisateurRepo = new UtilisateurRepository(TestUtil.prisma);
  const utilisateurBoardRepository = new UtilisateurBoardRepository(
    TestUtil.prisma,
  );
  const communeRepository = new CommuneRepository();
  const prsonalisator = new Personnalisator(communeRepository);

  const gamificationUsecase = new GamificationUsecase(
    utilisateurRepo,
    utilisateurBoardRepository,
    communeRepository,
    prsonalisator,
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

  it(`GET /utilisateurs/id/classement/national retourne le top 3 France ok`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'yo',
      email: '1',
      points_classement: 10,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'yi',
      email: '2',
      points_classement: 20,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      prenom: 'ya',
      email: '3',
      points_classement: 30,
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
      prenom: 'ya',
    });
    expect(response.body.top_trois[2]).toStrictEqual({
      points: 10,
      rank: 3,
      prenom: 'yo',
    });
  });

  it(`GET /utilisateurs/id/classement retourne le top 3 commune utilisateur ok`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'palaiseau_1',
      email: '1',
      points_classement: 10,
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'palaiseau_2',
      email: '2',
      points_classement: 20,
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      prenom: 'palaiseau_3',
      email: '3',
      points_classement: 30,
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      prenom: 'dijon_1',
      email: '4',
      points_classement: 10,
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      prenom: 'dijon_2',
      email: '5',
      points_classement: 20,
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/local',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.utilisateur.rank).toEqual(1);
    expect(response.body).toEqual({
      classement_utilisateur: [
        { points: 20, prenom: 'dijon_2', rank: 1 },
        { points: 10, prenom: 'dijon_1', rank: 2 },
      ],
      code_postal: '21000',
      commune_label: 'Dijon',
      pourcentile: 'pourcent_5',
      top_trois: [
        { points: 20, prenom: 'dijon_2', rank: 1 },
        { points: 10, prenom: 'dijon_1', rank: 2 },
      ],
      utilisateur: { points: 20, prenom: 'dijon_2', rank: 1 },
    });
  });

  it(`GET /utilisateurs/id/classement retourne le national utilisateur ok`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      prenom: 'palaiseau_1',
      email: '1',
      points_classement: 10,
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      prenom: 'palaiseau_2',
      email: '2',
      points_classement: 20,
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      prenom: 'palaiseau_3',
      email: '3',
      points_classement: 30,
      code_postal_classement: '91120',
      commune_classement: 'PALAISEAU',
    });

    await TestUtil.create(DB.utilisateur, {
      id: '4',
      prenom: 'dijon_1',
      email: '4',
      points_classement: 10,
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      prenom: 'dijon_2',
      email: '5',
      points_classement: 20,
      code_postal_classement: '21000',
      commune_classement: 'DIJON',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/classement/national',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.utilisateur.rank).toEqual(2);
    expect(response.body.top_trois[0].prenom).toEqual('palaiseau_3');
    expect(response.body.utilisateur).toEqual({
      points: 20,
      rank: 2,
      prenom: 'dijon_2',
    });
    expect(response.body.classement_utilisateur[0].prenom).toEqual(
      'palaiseau_3',
    );
    expect(response.body.classement_utilisateur[4].prenom).toEqual('dijon_1');
    expect(response.body.pourcentile).toEqual(Pourcentile.pourcent_25);
    expect(response.body.code_postal).toEqual(null);
    expect(response.body.commune_label).toEqual(null);
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
