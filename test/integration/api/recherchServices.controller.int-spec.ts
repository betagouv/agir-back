import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { DB, TestUtil } from '../../TestUtil';

describe('RechercheServices (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
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

  it(`POST /utlilisateur/id/recherche_services/proximite/search renvoie une liste de résultats`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    );

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].titre).toEqual(`Mon Epice'Rit`);
    expect(response.body[1].titre).toEqual(`L'ébullition`);
    expect(response.body[2].titre).toEqual(`L’Auvergnat Bio`);
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search 404 si service de recherche pas connu`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/bad_service/search',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search 400 si utilisateur sans code postal`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: null,
      chauffage: Chauffage.bois,
      commune: null,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('053');
  });
  it(`GET /utlilisateur/id/recherche_services/proximite/favoris  liste les favoris de ce service de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/favoris',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toStrictEqual({
      id: 'DwG',
      titre: "Mon Epice'Rit",
      adresse_code_postal: '91120',
      adresse_nom_ville: 'Palaiseau',
      adresse_rue: '4 Rue des Écoles',
      site_web: 'https://www.monepi.fr/monepicerit',
    });
  });
});
