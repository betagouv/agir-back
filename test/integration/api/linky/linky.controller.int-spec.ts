import { DB, TestUtil } from '../../../TestUtil';

const _linky_data = require('../../../../test_data/PRM_thermo_pas_sensible');
const _linky_full_BDD_data = require('./data_linky_BDD_exemple.json');

describe('Linky (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
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
    expect(response.body.data).toHaveLength(1097);
  });
  it('GET /utilisateurs/id/linky renvoie les data linky full avec correction à la volée', async () => {
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
          date: '2021-12-20T12:00:00.000Z',
          day_value: null,
          value_cumulee: 10,
        },
        {
          date: '2021-12-21T12:00:00.000Z',
          day_value: null,
          value_cumulee: 20,
        },
        {
          date: '2021-12-22T12:00:00.000Z',
          day_value: null,
          value_cumulee: 40,
        },
        {
          date: '2021-12-23T12:00:00.000Z',
          day_value: null,
          value_cumulee: 70,
        },
      ],
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(4);
    expect(response.body.data[0].valeur).toEqual(10);
    expect(response.body.data[3].valeur).toEqual(30);

    const linkyDB = (await TestUtil.prisma.linky.findMany())[0];

    expect(linkyDB.data[3].day_value).toEqual(30);
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
    expect(response.body.data).toHaveLength(1097);
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
    expect(response.body.data[0].mois).toEqual('août');
    expect(response.body.data[0].annee).toEqual('2022');
    expect(response.body.data[1].mois).toEqual('août');
    expect(response.body.data[1].annee).toEqual('2023');
    expect(response.body.data[2].mois).toEqual('septembre');
    expect(response.body.data[2].annee).toEqual('2022');
    expect(response.body.data[3].mois).toEqual('septembre');
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
    expect(response.body.data).toHaveLength(1097);
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
      `Votre consommation a <strong>augmenté de +107.84%</strong> entre vendredi et samedi dernier`,
    );
    expect(response.body.commentaires[1]).toEqual(
      `Au cours des 2 dernières semaines, votre consommation éléctrique a <strong>augmenté de +58%</strong> par rapport à la même période l'année dernière`,
    );
  });

  it('GET /utilisateurs/id/linky comparaison 15 derniers jours avec data full', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create(DB.linky, {
      data: _linky_full_BDD_data,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/linky?derniers_14_jours=true',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(28);
    expect(response.body.data).toEqual([
      {
        date: '2023-10-09T00:00:00.000Z',
        valeur: 12898,
        jour: 'lundi',
        jour_val: 9,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-09T00:00:00.000Z',
        valeur: 9006,
        jour: 'mercredi',
        jour_val: 9,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-10T00:00:00.000Z',
        valeur: 7765,
        jour: 'mardi',
        jour_val: 10,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-10T00:00:00.000Z',
        valeur: 12337,
        jour: 'jeudi',
        jour_val: 10,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-11T00:00:00.000Z',
        valeur: 5100,
        jour: 'mercredi',
        jour_val: 11,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-11T00:00:00.000Z',
        valeur: 4988,
        jour: 'vendredi',
        jour_val: 11,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-12T00:00:00.000Z',
        valeur: 10763,
        jour: 'jeudi',
        jour_val: 12,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-12T00:00:00.000Z',
        valeur: 8531,
        jour: 'samedi',
        jour_val: 12,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-13T00:00:00.000Z',
        valeur: 4654,
        jour: 'vendredi',
        jour_val: 13,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-13T00:00:00.000Z',
        valeur: 12702,
        jour: 'dimanche',
        jour_val: 13,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-14T00:00:00.000Z',
        valeur: 5837,
        jour: 'samedi',
        jour_val: 14,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-14T00:00:00.000Z',
        valeur: 12542,
        jour: 'lundi',
        jour_val: 14,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-15T00:00:00.000Z',
        valeur: 12462,
        jour: 'dimanche',
        jour_val: 15,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-15T00:00:00.000Z',
        valeur: 13082,
        jour: 'mardi',
        jour_val: 15,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-16T00:00:00.000Z',
        valeur: 11953,
        jour: 'lundi',
        jour_val: 16,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-16T00:00:00.000Z',
        valeur: 6948,
        jour: 'mercredi',
        jour_val: 16,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-17T00:00:00.000Z',
        valeur: 7214,
        jour: 'mardi',
        jour_val: 17,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-17T00:00:00.000Z',
        valeur: 11496,
        jour: 'jeudi',
        jour_val: 17,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-18T00:00:00.000Z',
        valeur: 9116,
        jour: 'mercredi',
        jour_val: 18,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-18T00:00:00.000Z',
        valeur: 11501,
        jour: 'vendredi',
        jour_val: 18,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-19T00:00:00.000Z',
        valeur: 11360,
        jour: 'jeudi',
        jour_val: 19,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-19T00:00:00.000Z',
        valeur: 11479,
        jour: 'samedi',
        jour_val: 19,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-20T00:00:00.000Z',
        valeur: 7365,
        jour: 'vendredi',
        jour_val: 20,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-20T00:00:00.000Z',
        valeur: 11479,
        jour: 'dimanche',
        jour_val: 20,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-21T00:00:00.000Z',
        valeur: 7157,
        jour: 'samedi',
        jour_val: 21,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-21T00:00:00.000Z',
        valeur: 25285,
        jour: 'lundi',
        jour_val: 21,
        mois: 'octobre',
        annee: '2024',
      },
      {
        date: '2023-10-22T00:00:00.000Z',
        valeur: 9625,
        jour: 'dimanche',
        jour_val: 22,
        mois: 'octobre',
        annee: '2023',
      },
      {
        date: '2024-10-22T00:00:00.000Z',
        valeur: 10744,
        jour: 'mardi',
        jour_val: 22,
        mois: 'octobre',
        annee: '2024',
      },
    ]);
    expect(response.body.commentaires).toHaveLength(2);
    expect(response.body.commentaires[0]).toEqual(
      `Votre consommation a <strong>diminué de -57.51%</strong> entre lundi et mardi dernier`,
    );
    expect(response.body.commentaires[1]).toEqual(
      `Au cours des 2 dernières semaines, votre consommation éléctrique a <strong>augmenté de +32%</strong> par rapport à la même période l'année dernière`,
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
          date: new Date(),
          day_value: 1000,
          value_cumulee: null,
        },
      ] as any,
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
          date: hier,
          day_value: 1000,
          value_cumulee: null,
        },
      ] as any,
    });

    // WHEN
    const response = await TestUtil.POST('/admin/linky_stats');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body[0][0]).toEqual('PRM');
    expect(response.body[1]).toHaveLength(32);

    expect(response.body[1][0]).toEqual('1');
    expect(response.body[1][31]).toEqual('CO');
    expect(response.body[1][30]).toEqual('HX');

    expect(response.body[2][0]).toEqual('2');
    expect(response.body[2][31]).toEqual('X');
    expect(response.body[2][30]).toEqual('O');
  });
});
