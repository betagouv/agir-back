import * as request from 'supertest';
import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/suivi_dashboard (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/suivi_dashboard - get empty dashboard when nothing in DB', async () => {
    await TestUtil.create('utilisateur');
    const response = await request(TestUtil.app.getHttpServer()).get(
      '/utilisateurs/utilisateur-id/suivi_dashboard',
    );
    expect(response.status).toBe(200);
  });
  it('GET /utilisateurs/id/suivi_dashboard - get dashboard with proper last suivi date', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('suivi', { id: '1', created_at: new Date(1) });
    await TestUtil.create('suivi', { id: '2', created_at: new Date(2) });
    await TestUtil.create('suivi', { id: '3', created_at: new Date(5) });
    const response = await request(TestUtil.app.getHttpServer()).get(
      '/utilisateurs/utilisateur-id/suivi_dashboard',
    );
    expect(response.status).toBe(200);
    expect(Date.parse(response.body.date_dernier_suivi)).toEqual(5);
  });
});
