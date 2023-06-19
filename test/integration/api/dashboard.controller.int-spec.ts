import * as request from 'supertest';
import { TestUtil } from '../../TestUtil';

describe('/dashboard (API test)', () => {

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('GET /dashboard/name - get a dashboard of a given user', async () => {
  });


});
