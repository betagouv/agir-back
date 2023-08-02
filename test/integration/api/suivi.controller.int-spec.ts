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
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    const response = await TestUtil.getServer().get('/utilisateurs/123/suivis');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/123/suivis - get all suivis', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        data: {
          viande_rouge: 1,
        },
        type: 'alimentation',
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        data: {
          km_voiture: 20,
        },
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });

    const response = await TestUtil.getServer().get('/utilisateurs/123/suivis');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('GET /utilisateurs/123/suivis?type=alimentation - get all suivis by type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'alimentation',
        data: {
          viande_rouge: 1,
        },
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        data: {
          km_voiture: 20,
        },
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });

    const response = await TestUtil.getServer().get(
      '/utilisateurs/123/suivis?type=alimentation',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].type).toEqual(SuiviType.alimentation);
  });
  it('GET /utilisateurs/123/suivis/last - get last suivis', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'alimentation',
        data: {
          viande_rouge: 1,
        },
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        data: {
          km_voiture: 20,
        },
        utilisateurId: '123',
        created_at: new Date(456),
      },
    });

    const response = await TestUtil.getServer().get(
      '/utilisateurs/123/suivis/last',
    );

    expect(response.status).toBe(200);
    expect(response.body.type).toEqual('transport');
  });
  it('GET /utilisateurs/123/suivis/last - get last suivis by type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'alimentation',
        data: {
          viande_rouge: 1,
        },
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        data: {
          km_voiture: 20,
        },
        utilisateurId: '123',
        created_at: new Date(456),
      },
    });

    const response = await TestUtil.getServer().get(
      '/utilisateurs/123/suivis/last?type=transport',
    );

    expect(response.status).toBe(200);
    expect(response.body.type).toEqual('transport');
  });
  it('GET /utilisateurs/123/suivis/last - get last suivis by type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'alimentation',
        data: {
          viande_rouge: 1,
        },
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        data: {
          km_voiture: 20,
        },
        utilisateurId: '123',
        created_at: new Date(456),
      },
    });

    const response = await TestUtil.getServer().get(
      '/utilisateurs/123/suivis/last?type=alimentation',
    );

    expect(response.status).toBe(200);
    expect(response.body.type).toEqual('alimentation');
  });
  it('GET /utilisateurs/123/suivis/last - get empty when empty DB of suivis', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    const response = await TestUtil.getServer().get(
      '/utilisateurs/123/suivis/last?type=transport',
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      'Aucun suivi de type transport trouvé en base',
    );
  });
  it('POST /utilisateurs/123/suivis - creates a new suivi', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    const response = await TestUtil.getServer()
      .post('/utilisateurs/123/suivis')
      .send({
        type: 'alimentation',
        viande_rouge: 0,
        tres_cher: true,
      });
    expect(response.status).toBe(201);

    let suiviDB = (await TestUtil.prisma.suivi.findMany({}))[0];
    expect(response.body.id).toEqual(suiviDB.id);
    expect(suiviDB.type).toEqual('alimentation');
  });
  it('POST /utilisateurs/123/suivis - creates a new suivi an read it back through API', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    let response = await TestUtil.getServer()
      .post('/utilisateurs/123/suivis')
      .send({
        type: 'alimentation',
        viande_rouge: 11,
        poisson_blanc: 1,
        tres_cher: true,
      });
    expect(response.status).toBe(201);

    response = await TestUtil.getServer().get('/utilisateurs/123/suivis');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].viande_rouge).toStrictEqual(11);
    expect(response.body[0].viande_rouge_impact).toStrictEqual(60610);
    expect(response.body[0].total_impact).toStrictEqual(62978);
    expect(response.body[0].tres_cher).toStrictEqual(true);
  });
});
