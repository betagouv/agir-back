import { SuiviType } from '../../../src/domain/suivi/suiviType';
import { TestUtil } from '../../TestUtil';

describe('/suivis (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/123/suivis - liste vide si pas de suivi', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/123/suivis - get all suivis', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    await TestUtil.create('suivi', {
      id: '1',
      data: {
        viande_rouge: 1,
      },
      type: 'alimentation',
      created_at: new Date(123),
    });
    await TestUtil.create('suivi', {
      id: '2',
      type: 'transport',
      data: {
        km_voiture: 20,
      },
      created_at: new Date(123),
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('GET /utilisateurs/123/suivis?type=alimentation - get all suivis by type', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    await TestUtil.create('suivi', {
      id: '1',
      type: 'alimentation',
      data: {
        viande_rouge: 1,
      },
      created_at: new Date(123),
    });
    await TestUtil.create('suivi', {
      id: '2',
      type: 'transport',
      data: {
        km_voiture: 20,
      },
      created_at: new Date(123),
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis?type=alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].type).toEqual(SuiviType.alimentation);
  });
  it('GET /utilisateurs/123/suivis/last - get last suivis', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    await TestUtil.create('suivi', {
      id: '1',
      type: 'alimentation',
      data: {
        viande_rouge: 1,
      },
      created_at: new Date(123),
    });
    await TestUtil.create('suivi', {
      id: '2',
      type: 'transport',
      data: {
        km_voiture: 20,
      },
      created_at: new Date(456),
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis/last',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.type).toEqual('transport');
  });
  it('GET /utilisateurs/123/suivis/last - get last suivis by type', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    await TestUtil.create('suivi', {
      id: '1',
      type: 'alimentation',
      data: {
        viande_rouge: 1,
      },
      created_at: new Date(123),
    });
    await TestUtil.create('suivi', {
      id: '2',
      type: 'transport',
      data: {
        km_voiture: 20,
      },
      created_at: new Date(456),
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis/last?type=transport',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.type).toEqual('transport');
  });
  it('GET /utilisateurs/123/suivis/last - get last suivis by type', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    await TestUtil.create('suivi', {
      id: '1',
      type: 'alimentation',
      data: {
        viande_rouge: 1,
      },
      created_at: new Date(123),
    });
    await TestUtil.create('suivi', {
      id: '2',
      type: 'transport',
      data: {
        km_voiture: 20,
      },
      created_at: new Date(456),
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis/last?type=alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.type).toEqual('alimentation');
  });
  it('GET /utilisateurs/123/suivis/last - get empty when empty DB of suivis', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis/last?type=transport',
    );

    // THEN
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      'Aucun suivi de type transport trouvé en base',
    );
  });
  it('POST /utilisateurs/123/suivis - creates a new suivi', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/utilisateur-id/suivis')
      .send({
        type: 'alimentation',
        viande_rouge: 0,
        tres_cher: true,
      });
    // THEN
    expect(response.status).toBe(201);

    let suiviDB = (await TestUtil.prisma.suivi.findMany({}))[0];
    expect(response.body.id).toEqual(suiviDB.id);
    expect(suiviDB.type).toEqual('alimentation');
  });
  it('POST /utilisateurs/123/suivis - creates a new suivi an read it back through API', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    let response = await TestUtil.getServer()
      .post('/utilisateurs/utilisateur-id/suivis')
      .send({
        type: 'alimentation',
        viande_rouge: 11,
        poisson_blanc: 1,
        tres_cher: true,
      });
    // THEN
    expect(response.status).toBe(201);

    response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/suivis',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].viande_rouge).toStrictEqual(11);
    expect(response.body[0].viande_rouge_impact).toStrictEqual(60610);
    expect(response.body[0].total_impact).toStrictEqual(62978);
    expect(response.body[0].tres_cher).toStrictEqual(true);
  });
});
