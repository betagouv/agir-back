import { DB, TestUtil } from '../../../TestUtil';

const _linky_data = require('../../../../test_data/PRM_thermo_sensible');

describe('Linky (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy

    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/linky renvoie tableau vide si pas de service', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });
  it('GET /utilisateurs/id/linky renvoie tableau vide si pas data linky', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });
  it('GET /utilisateurs/id/linky renvoie les data linky', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky);

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].date).toEqual(new Date(123).toISOString());
    expect(response.body.data[0].valeur).toEqual(100);
    expect(response.body.data[0].valeur_corrigee).toEqual(110);
  });
  it('GET /utilisateurs/id/linky renvoie les data linky full', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, { data: _linky_data });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(724);
  });
  it('GET /utilisateurs/id/linky renvoie data full si on demande plus que existant', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, { data: _linky_data });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?detail=jour&nombre=1000',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(724);
  });
  it('GET /utilisateurs/id/linky renvoie les 13 derniers jours', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, { data: _linky_data });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?detail=jour&nombre=13',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(13);
    expect(response.body.data[0].jour).toEqual('vendredi');
  });
  it('GET /utilisateurs/id/linky renvoie les 2 dernière sem', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, {
      data: [
        {
          time: '2021-11-30T12:00:00.000Z',
          value: 1000,
          value_at_normal_temperature: 2000,
        },
        {
          time: '2021-12-01T12:00:00.000Z',
          value: 1,
          value_at_normal_temperature: 2,
        },
        {
          time: '2021-12-02T12:00:00.000Z',
          value: 1,
          value_at_normal_temperature: 2,
        },
        {
          time: '2021-12-03T12:00:00.000Z',
          value: 1,
          value_at_normal_temperature: 2,
        },
        {
          time: '2021-12-04T12:00:00.000Z',
          value: 1,
          value_at_normal_temperature: 2,
        },
        {
          time: '2021-12-05T12:00:00.000Z',
          value: 1,
          value_at_normal_temperature: 2,
        },
        {
          time: '2021-12-06T12:00:00.000Z',
          value: 1,
          value_at_normal_temperature: 2,
        },
        {
          time: '2021-12-07T12:00:00.000Z',
          value: 1,
          value_at_normal_temperature: 2,
        },
        {
          time: '2021-12-08T12:00:00.000Z',
          value: 2,
          value_at_normal_temperature: 4,
        },
        {
          time: '2021-12-09T12:00:00.000Z',
          value: 2,
          value_at_normal_temperature: 4,
        },
        {
          time: '2021-12-10T12:00:00.000Z',
          value: 2,
          value_at_normal_temperature: 4,
        },
        {
          time: '2021-12-11T12:00:00.000Z',
          value: 2,
          value_at_normal_temperature: 4,
        },
        {
          time: '2021-12-12T12:00:00.000Z',
          value: 2,
          value_at_normal_temperature: 4,
        },
        {
          time: '2021-12-12T12:00:00.000Z',
          value: 2,
          value_at_normal_temperature: 4,
        },
        {
          time: '2021-12-14T12:00:00.000Z',
          value: 2,
          value_at_normal_temperature: 4,
        },
      ],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?detail=semaine&nombre=2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].valeur).toEqual(7);
    expect(response.body.data[0].valeur_corrigee).toEqual(14);
    expect(response.body.data[1].valeur).toEqual(14);
    expect(response.body.data[1].valeur_corrigee).toEqual(28);
  });
  it('GET /utilisateurs/id/linky renvoie les 3 derniers mois', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, {
      data: _linky_data,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?detail=mois&nombre=3&end_date=2023-12-15',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data[0].mois).toEqual('octobre');
    expect(Math.floor(response.body.data[0].valeur)).toEqual(213);
    expect(response.body.data[1].mois).toEqual('novembre');
    expect(Math.floor(response.body.data[1].valeur)).toEqual(435);
    expect(response.body.data[2].mois).toEqual('décembre');
    expect(Math.floor(response.body.data[2].valeur)).toEqual(289);
  });
  it('GET /utilisateurs/id/linky comparaison 2 dernieres annéee', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, {
      data: _linky_data,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?compare_annees=true',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(24);
    expect(response.body.data[0].mois).toEqual('janvier');
    expect(response.body.data[0].annee).toEqual('2022');
    expect(response.body.data[1].mois).toEqual('janvier');
    expect(response.body.data[1].annee).toEqual('2023');
    expect(response.body.data[2].mois).toEqual('février');
    expect(response.body.data[2].annee).toEqual('2022');
    expect(response.body.data[3].mois).toEqual('février');
    expect(response.body.data[3].annee).toEqual('2023');
  });
  it('GET /utilisateurs/id/linky compare_annees=false', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, {
      data: _linky_data,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?compare_annees=false',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(724);
  });
  it('GET /utilisateurs/id/linky comparaison 2 dernieres annéee - pas d erreurs si pas de donnees', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, {
      data: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?compare_annees=true',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });
  it('GET /utilisateurs/id/linky comparaison 15 derniers jours', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, {
      data: _linky_data,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?derniers_14_jours=true',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(28);
    expect(response.body.commentaires).toHaveLength(2);
    expect(response.body.commentaires[0]).toEqual(
      `Votre consommation a <strong>augmenté de +34.21%</strong> entre mardi et mercredi dernier`,
    );
    expect(response.body.commentaires[1]).toEqual(
      `Au cours des 2 dernières semaines, votre consommation éléctrique a <strong>augmenté de +15%</strong> par rapport à la même période l'année dernière`,
    );
  });

  it('POST /admin/linky_stats la qualité de réception pour le dernier mois', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    await TestUtil.create(DB.linky, {
      prm: '1',
      utilisateurId: undefined,
      winter_pk: undefined,
      data: [
        {
          time: new Date(),
          value: 1000,
          value_at_normal_temperature: 2000,
        },
      ],
    });
    const hier = new Date();
    const ajd_minus_10 = new Date();
    hier.setDate(hier.getDate() - 1);
    ajd_minus_10.setDate(ajd_minus_10.getDate() - 10);
    await TestUtil.create(DB.linky, {
      prm: '2',
      utilisateurId: undefined,
      winter_pk: undefined,
      created_at: ajd_minus_10,
      data: [
        {
          time: hier,
          value: 1000,
          value_at_normal_temperature: 2000,
        },
      ],
    });

    // WHEN
    const response = await TestUtil.POST('/admin/linky_stats');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body[0][0]).toEqual('PRM');
    expect(response.body[1]).toHaveLength(32);

    expect(response.body[1][0]).toEqual('1');
    expect(response.body[1][31]).toEqual('O');
    expect(response.body[1][30]).toEqual('-');

    expect(response.body[2][0]).toEqual('2');
    expect(response.body[2][31]).toEqual('X');
    expect(response.body[2][30]).toEqual('O');
  });
});
