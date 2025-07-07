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

  it(`GET /code_postal_synthese - renvoie la synthèse du code postal, 1 aide local`, async () => {
    // GIVEN
    const logement: Partial<Logement_v0> = {
      code_postal: '21000',
      version: 0,
      code_commune: '21231',
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });
    await TestUtil.create(DB.aide, { codes_postaux: ['21000'] });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/code_postal_synthese_v2/21231',
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      est_EPCI: false,
      liste_aides_departement: [],
      liste_aides_locales: [
        {
          id: '1',
          thematiques: ['climat', 'logement'],
          titre: 'titreA',
        },
      ],
      liste_aides_nationales: [],
      liste_aides_region: [],
      liste_articles_departement: [],
      liste_articles_locales: [],
      liste_articles_region: [],
      liste_codes_postaux_dans_EPCI: ['21000'],
      liste_communes_dans_EPCI: [],
      nom_commune_ou_collectivite: 'Dijon',
      nom_departement: "Côte-d'Or",
      nom_region: 'Bourgogne-Franche-Comté',
      nombre_inscrits_local: 1,
      nombre_inscrits_local_dernier_mois: 1,
      nombre_inscrits_total: 1,
      nombre_points_moyen: 10,
      nombre_inscrits_total_dernier_mois: 0,
      pourcent_actions_alimentation: 0,
      pourcent_actions_consommation: 0,
      pourcent_actions_logement: 0,
      pourcent_actions_transport: 0,
    });
  });
});
