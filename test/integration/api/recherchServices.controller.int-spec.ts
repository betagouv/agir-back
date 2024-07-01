import { ServiceRechercheID } from '../../../src/domain/bibliotheque_services/serviceRechercheID';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { BibliothequeServices_v0 } from '../../../src/domain/object_store/service/BibliothequeService_v0';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

const logement_palaiseau: Logement_v0 = {
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

describe('RechercheServices (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
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
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

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

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services).toHaveLength(1);
    expect(userDB.bilbiotheque_services.liste_services[0].id).toEqual(
      ServiceRechercheID.proximite,
    );
    expect(
      userDB.bilbiotheque_services.liste_services[0].derniere_recherche,
    ).toHaveLength(3);
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search petit rayon => moins de résultats`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({
      rayon_metres: 400,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search limite du nombre de résultats`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({
      rayon_metres: 1000,
      nombre_max_resultats: 1,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
  });

  it(`POST /utlilisateur/id/recherche_services/proximite/search renvoie une liste de résultats avec filtre de categorie`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({
      categorie: 'lieux_collaboratifs',
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].titre).toEqual(`L'ébullition`);
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
    await TestUtil.create(DB.utilisateur, {
      logement: { ...logement_palaiseau, code_postal: null },
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('053');
  });

  it(`GET /utlilisateur/id/recherche_services/proximite/favoris  liste 0 favoris`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/favoris',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it(`GET /utlilisateur/id/recherche_services/proximite/favoris  liste les favoris de ce service de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    );
    await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/last_results/DwG/add_to_favoris',
    );

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/favoris',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toStrictEqual({
      id: 'DwG',
      titre: "Mon Epice'Rit",
      adresse_code_postal: '91120',
      adresse_nom_ville: 'Palaiseau',
      adresse_rue: '4 Rue des Écoles',
      site_web: 'https://www.monepi.fr/monepicerit',
    });
  });

  it(`POST /utlilisateur/id/recherche_services/proximite/last_results/id/add_to_favoris  404 si l'id de resultat de recherche n'existe pas`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/last_results/1/add_to_favoris',
    );

    // THEN
    expect(response.status).toBe(404);
    expect(response.body.code).toEqual('054');
  });

  it(`POST /utlilisateur/id/recherche_services/proximite/last_results/id/add_to_favoris  ajoute au favoris suite à la dernière recherche`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    );

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].id).toEqual('DwG');

    // WHEN
    response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/last_results/DwG/add_to_favoris',
    );

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services[0].favoris).toHaveLength(
      1,
    );
    expect(
      userDB.bilbiotheque_services.liste_services[0].favoris[0]
        .resulat_recherche.id,
    ).toEqual('DwG');
    expect(
      userDB.bilbiotheque_services.liste_services[0].favoris[0].date_ajout.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });

  it(`DELETE /utlilisateur/id/recherche_services/proximite/favoris/id  supprime un favoris`, async () => {
    // GIVEN
    const biblio: BibliothequeServices_v0 = {
      version: 0,
      liste_services: [
        {
          id: ServiceRechercheID.proximite,
          derniere_recherche: [],
          favoris: [
            {
              date_ajout: new Date(),
              resulat_recherche: {
                id: '123',
                adresse_code_postal: 'a',
                adresse_nom_ville: 'b',
                adresse_rue: 'c',
                latitude: 1,
                longitude: 2,
                site_web: 'e',
                titre: 'haha',
              },
            },
          ],
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement_palaiseau,
      bilbiotheque_services: biblio,
    });

    // WHEN
    let response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/favoris/123',
    );

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services[0].favoris).toHaveLength(
      0,
    );
  });

  it(`POST /utlilisateur/id/recherche_services/proximite/last_results/id/add_to_favoris  ajoute 2 fois en favoris ne fait qu'un favoris`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    );

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].id).toEqual('DwG');

    // WHEN
    await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/last_results/DwG/add_to_favoris',
    );
    response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/last_results/DwG/add_to_favoris',
    );

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services[0].favoris).toHaveLength(
      1,
    );
    expect(
      userDB.bilbiotheque_services.liste_services[0].favoris[0]
        .resulat_recherche.id,
    ).toEqual('DwG');
    expect(
      userDB.bilbiotheque_services.liste_services[0].favoris[0].date_ajout.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });

  it(`GET /utlilisateur/id/recherche_services/proximite/categories  listes les categories du service proximité`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/categories',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([
      {
        code: 'lieux_collaboratifs',
        label: 'Lieux collaboratifs',
      },
      {
        code: 'nourriture',
        label: 'Nourriture',
      },
    ]);
  });
});
