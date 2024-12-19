import { ConformiteRepository } from '../../../src/infrastructure/repository/conformite.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Conformite (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it(`lecture d'une page de conformité`, async () => {
    // GIVEN
    await TestUtil.create(DB.conformite);
    const confo_repo = new ConformiteRepository(TestUtil.prisma);
    await confo_repo.loadConformite();

    // WHEN
    const response = await TestUtil.GET('/pages_conformite/code');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 'code',
      content_id: '1',
      contenu: 'content',
      titre: 'titreA',
    });
  });
});
