import * as request from 'supertest';
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

    const response = await request(TestUtil.app.getHttpServer()).get(
      '/utilisateurs/123/suivis',
    );

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
        type: 'repas',
        attributs: ['viande_rouge'],
        valeurs: ['1'],
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        attributs: ['km_voiture'],
        valeurs: ['20'],
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });

    const response = await request(TestUtil.app.getHttpServer()).get(
      '/utilisateurs/123/suivis',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('GET /utilisateurs/123/suivis?type=repas - get all suivis by type', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'repas',
        attributs: ['viande_rouge'],
        valeurs: ['1'],
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        attributs: ['km_voiture'],
        valeurs: ['20'],
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });

    const response = await request(TestUtil.app.getHttpServer()).get(
      '/utilisateurs/123/suivis?type=repas',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].type).toEqual('repas');
  });
  it('GET /utilisateurs/123/suivis/last - get last suivis', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    await TestUtil.prisma.suivi.create({
      data: {
        id: '1',
        type: 'repas',
        attributs: ['viande_rouge'],
        valeurs: ['1'],
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        attributs: ['km_voiture'],
        valeurs: ['20'],
        utilisateurId: '123',
        created_at: new Date(456),
      },
    });

    const response = await request(TestUtil.app.getHttpServer()).get(
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
        type: 'repas',
        attributs: ['viande_rouge'],
        valeurs: ['1'],
        utilisateurId: '123',
        created_at: new Date(123),
      },
    });
    await TestUtil.prisma.suivi.create({
      data: {
        id: '2',
        type: 'transport',
        attributs: ['km_voiture'],
        valeurs: ['20'],
        utilisateurId: '123',
        created_at: new Date(456),
      },
    });

    const response = await request(TestUtil.app.getHttpServer()).get(
      '/utilisateurs/123/suivis/last?type=repas',
    );

    expect(response.status).toBe(200);
    expect(response.body.type).toEqual('repas');
  });
  it('POST /utilisateurs/123/suivis - creates a new suivi', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    const response = await request(TestUtil.app.getHttpServer())
      .post('/utilisateurs/123/suivis')
      .send({
        type: 'repas',
        viande_rouge: 0,
        tres_cher: true,
      });
    expect(response.status).toBe(201);

    let suiviDB = await TestUtil.prisma.suivi.findMany({});
    expect(suiviDB).toHaveLength(1);
    expect(suiviDB[0].type).toEqual('repas');
  });
  it('POST /utilisateurs/123/suivis - creates a new suivi an read it back through API', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: { id: '123', name: 'bob' },
    });

    let response = await request(TestUtil.app.getHttpServer())
      .post('/utilisateurs/123/suivis')
      .send({
        type: 'repas',
        viande_rouge: 11,
        tres_cher: true,
      });
    expect(response.status).toBe(201);

    response = await request(TestUtil.app.getHttpServer()).get(
      '/utilisateurs/123/suivis',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].viande_rouge).toStrictEqual(11);
    expect(response.body[0].tres_cher).toStrictEqual(true);
  });
});
