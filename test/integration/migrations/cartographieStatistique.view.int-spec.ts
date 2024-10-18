import { DB, TestUtil } from '../../TestUtil';

describe('CartographieView', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('create la vue CartographieStatistique', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur1',
      email: 'user1@dev.com',
      couverture_aides_ok: true,
      logement: {
        code_postal: '22000',
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur2',
      email: 'user2@dev.com',
      couverture_aides_ok: false,
      logement: {
        code_postal: null,
      },
    });

    // WHEN
    const cartographieVue = await TestUtil.prisma.cartographieVue.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    delete cartographieVue[0].id;
    delete cartographieVue[1].id;

    // THEN
    expect(cartographieVue).toStrictEqual([
      {
        code_postal: '22000',
        couvert_par_aides: true,
        code_departement: '22',
      },
      {
        code_postal: null,
        couvert_par_aides: false,
        code_departement: null,
      },
    ]);
  });
});
