import { TestUtil } from '../../TestUtil';

describe('/communes (API test)', () => {
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

  it('GET /communes?code_postal=XXXX - mauvais code postal renvoie liste vide', async () => {
    // WHEN
    const response = await TestUtil.GET('/communes?code_postal=99999');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /communes?code_postal=XXXX - ville unique', async () => {
    // WHEN
    const response = await TestUtil.GET('/communes?code_postal=91120');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('PALAISEAU');
  });
  it('GET /communes?code_postal=XXXX - ville double', async () => {
    // WHEN
    const response = await TestUtil.GET('/communes?code_postal=26290');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toStrictEqual(['DONZERE', 'LES GRANGES GONTARDES']);
  });
  it('GET /communes_epci?nom=XXXX - renvoie la commune de palaiseau, case insensitive', async () => {
    // GIVEN
    await TestUtil.prisma.communesAndEPCI.create({
      data: {
        code_insee: '123',
        is_commune: true,
        is_epci: false,
        nom: 'Palaiseau',
        code_postaux: ['91120'],
        type_epci: null,
        codes_communes: [],
      },
    });

    // WHEN
    const response = await TestUtil.GET('/communes_epci?nom=PALAISEAU');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].nom).toEqual('Palaiseau');
  });
  it('GET /communes_epci?nom=XXXX - renvoie la commune de palaiseau, recherche partielle', async () => {
    // GIVEN
    await TestUtil.prisma.communesAndEPCI.create({
      data: {
        code_insee: '123',
        is_commune: true,
        is_epci: false,
        nom: 'Palaiseau',
        code_postaux: ['91120'],
        type_epci: null,
        codes_communes: [],
      },
    });

    // WHEN
    const response = await TestUtil.GET('/communes_epci?nom=ALA');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].nom).toEqual('Palaiseau');
  });
  it('GET /communes_epci?nom=XXXX - renvoie la commune de palaiseau, recherche partielle', async () => {
    // GIVEN
    await TestUtil.prisma.communesAndEPCI.create({
      data: {
        code_insee: '123',
        is_commune: false,
        is_epci: true,
        nom: 'Dijon Metropole',
        code_postaux: ['21000', '21800'],
        type_epci: 'METRO',
        codes_communes: ['1', '2'],
      },
    });

    // WHEN
    const response = await TestUtil.GET('/communes_epci?nom=Dijon');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].nom).toEqual('Dijon Metropole');
  });
});
