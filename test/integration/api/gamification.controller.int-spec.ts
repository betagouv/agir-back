import { CelebrationType } from '../../../src/domain/gamification/celebration';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { EventType } from '../../../src/domain/utilisateur/utilisateurEvent';
import { TestUtil } from '../../TestUtil';

describe('Gamification  (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/gamification retourne le nombre de points de l utilisateur ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

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
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/gamification',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.niveau).toEqual(2);
    expect(response.body.current_points_in_niveau).toEqual(5);
    expect(response.body.point_target_in_niveau).toEqual(15);
  });
  it('GET /utilisateurs/id/gamification retourne la liste de celebrations ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

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
    });
  });
  it('Le passage d un niveau ajoute une célebration ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      gamification: {
        points: 10,
        celebrations: [],
      },
    });
    await TestUtil.create('interaction', {
      done: false,
      type: InteractionType.article,
      points: 15,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      interaction_id: 'interaction-id',
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
    expect(dbUtilisateur.gamification['celebrations'][0].new_niveau).toEqual(3);
  });
});