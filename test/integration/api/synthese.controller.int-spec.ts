import { App } from '../../../src/domain/app';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { DB, TestUtil } from '../../TestUtil';

describe('Synthese (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it(`GET /code_postal_synthese - renvoie la synthèse du code postal, 1 inscrit`, async () => {
    // GIVEN
    process.env.BASIC_LOGIN = 'XXX';
    process.env.BASIC_PASSWORD = 'YYY';

    const base64 = App.getBasicLoginPwdBase64();

    const logement: Partial<Logement_v0> = { code_postal: '21000', version: 0 };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      popup_reset_vue: false,
      badges: [],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement,
      gamification: gamification as any,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .get('/code_postal_synthese/21000')
      .set('Authorization', `Basic ${base64}`);

    // THEN
    expect(response.status).toBe(200);

    expect(response.body.nombre_inscrits).toEqual(1);
    expect(response.body.nombre_points_moyen).toEqual(10);
  });
  it(`GET /code_postal_synthese - renvoie la synthèse du code postal, 0 inscrit`, async () => {
    // GIVEN
    process.env.BASIC_LOGIN = 'XXX';
    process.env.BASIC_PASSWORD = 'YYY';

    const base64 = App.getBasicLoginPwdBase64();

    const logement: Partial<Logement_v0> = { code_postal: '21000', version: 0 };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      popup_reset_vue: false,
      badges: [],
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement,
      gamification: gamification as any,
    });
    // WHEN
    const response = await TestUtil.getServer()
      .get('/code_postal_synthese/91120')
      .set('Authorization', `Basic ${base64}`);

    // THEN
    expect(response.status).toBe(200);

    expect(response.body.nombre_inscrits).toEqual(0);
    expect(response.body.nombre_points_moyen).toEqual(0);
  });
  it(`GET /code_postal_synthese - renvoie la synthèse du code postal, 1 aide local`, async () => {
    // GIVEN
    process.env.BASIC_LOGIN = 'XXX';
    process.env.BASIC_PASSWORD = 'YYY';

    const base64 = App.getBasicLoginPwdBase64();

    const logement: Partial<Logement_v0> = { code_postal: '21000', version: 0 };

    await TestUtil.create(DB.utilisateur, {
      logement: logement,
    });
    await TestUtil.create(DB.aide, { codes_postaux: ['21000'] });

    // WHEN
    const response = await TestUtil.getServer()
      .get('/code_postal_synthese/21000')
      .set('Authorization', `Basic ${base64}`);

    // THEN
    expect(response.status).toBe(200);

    expect(response.body.nombre_aides_total).toEqual(1);
    expect(response.body.nombre_aides_nat_total).toEqual(0);
    expect(response.body.nombre_aides_region_total).toEqual(0);
    expect(response.body.nombre_aides_departement_total).toEqual(0);
    expect(response.body.nombre_aides_commune_total).toEqual(1);
  });
});
