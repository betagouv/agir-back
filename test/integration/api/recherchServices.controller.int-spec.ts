import {
  CategorieRecherche,
  CategorieRechercheManager,
} from '../../../src/domain/bibliotheque_services/categorieRecherche';
import { Day } from '../../../src/domain/bibliotheque_services/days';
import { ServiceRechercheID } from '../../../src/domain/bibliotheque_services/serviceRechercheID';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { BibliothequeServices_v0 } from '../../../src/domain/object_store/service/BibliothequeService_v0';
import { ServiceFavorisStatistiqueRepository } from '../../../src/infrastructure/repository/serviceFavorisStatistique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { FruitLegume } from '../../../src/infrastructure/service/fruits/fruitEtLegumesServiceManager';
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
  const serviceFavorisStatistiqueRepository =
    new ServiceFavorisStatistiqueRepository(TestUtil.prisma);
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
                impact_carbone_kg: 1,
                image_url: 'https://',
                categories: ['a'],
                commitment: 'hahaha',
                description: 'description',
                description_more: 'description more',
                open_hours: [{ jour: Day.lundi, heures: 'toute la journée' }],
                openhours_more_infos: 'toute la journée',
                phone: '01234967937',
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

    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.POST('/services/compute_stats');

    await serviceFavorisStatistiqueRepository.loadCachedData();

    await TestUtil.generateAuthorizationToken('utilisateur-id');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/favoris',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toStrictEqual({
      id: '123',
      titre: 'haha',
      adresse_code_postal: 'a',
      adresse_nom_ville: 'b',
      adresse_rue: 'c',
      site_web: 'e',
      est_favoris: true,
      nombre_favoris: 1,
      impact_carbone_kg: 1,
      image_url: 'https://',
      categories: ['a'],
      commitment: 'hahaha',
      description: 'description',
      description_more: 'description more',
      open_hours: [
        {
          heures: 'toute la journée',
          jour: 'lundi',
        },
      ],
      openhours_more_infos: 'toute la journée',
      phone: '01234967937',
    });
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
  it(`POST /utlilisateur/id/recherche_services/proximite/search categorie inconnue`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ categorie: 'bad' });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('056');
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search categorie inconnue pour un service donné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/fruits_legumes/search',
    ).send({ categorie: CategorieRecherche.vegan });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('055');
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
                impact_carbone_kg: 1,
                image_url: 'https://',
                categories: ['a'],
                commitment: 'hahaha',
                description: 'description',
                description_more: 'description more',
                open_hours: [{ jour: Day.lundi, heures: 'toute la journée' }],
                openhours_more_infos: 'toute la journée',
                phone: '01234967937',
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
        code: 'circuit_court',
        label: 'Les producteurs locaux',
        is_default: false,
      },
      { code: 'nourriture', label: 'Tous les commerces', is_default: true },
      {
        code: 'epicerie_superette',
        label: 'Les épiceries et supérettes',
        is_default: false,
      },
      { code: 'marche_local', label: 'Les marchés locaux', is_default: false },
      { code: 'zero_dechet', label: 'Zéro déchet', is_default: false },
    ]);
  });

  it(`GET /utlilisateur/id/recherche_services/universId  listes les services pour un univers donné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recherche_services/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0]).toStrictEqual({
      id_service: 'fruits_legumes',
      titre: 'Fruits et légumes de saison',
      sous_titre: CategorieRechercheManager.getMoisCourant(),
      icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/cerise.png',
      univers: 'alimentation',
      external_url: 'https://impactco2.fr/outils/fruitsetlegumes',
      is_available_inhouse: true,
    });
    expect(response.body[1].external_url).toEqual(
      'https://presdecheznous.fr/map#/carte/91120',
    );
  });

  it(`GET /utlilisateur/id/recherche_services/universId  listes les services pour la home`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recherche_services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toStrictEqual({
      id_service: 'fruits_legumes',
      titre: 'Fruits et légumes de saison',
      sous_titre: CategorieRechercheManager.getMoisCourant(),
      icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/cerise.png',
      univers: 'alimentation',
      external_url: 'https://impactco2.fr/outils/fruitsetlegumes',
      is_available_inhouse: true,
    });
    expect(response.body[1].external_url).toEqual(
      'https://presdecheznous.fr/map#/carte/91120',
    );
  });

  it(`POST /services/compute_stats  calcul les stats de favoris pour les services, aucun usage`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST('/services/compute_stats');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toStrictEqual([]);
  });

  it(`POST /services/compute_stats  calcul les stats d'uu utilisateur avec 2 favoris`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const biblio1: BibliothequeServices_v0 = {
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
                impact_carbone_kg: 1,
                image_url: 'https://',
                categories: ['a'],
                commitment: 'hahaha',
                description: 'description',
                description_more: 'description more',
                open_hours: [{ jour: Day.lundi, heures: 'toute la journée' }],
                openhours_more_infos: 'toute la journée',
                phone: '01234967937',
              },
            },
            {
              date_ajout: new Date(),
              resulat_recherche: {
                id: '456',
                adresse_code_postal: 'a',
                adresse_nom_ville: 'b',
                adresse_rue: 'c',
                latitude: 1,
                longitude: 2,
                site_web: 'e',
                titre: 'hoho',
                impact_carbone_kg: 1,
                image_url: 'https://',
                categories: ['a'],
                commitment: 'hahaha',
                description: 'description',
                description_more: 'description more',
                open_hours: [{ jour: Day.lundi, heures: 'toute la journée' }],
                openhours_more_infos: 'toute la journée',
                phone: '01234967937',
              },
            },
          ],
        },
      ],
    };
    const biblio2: BibliothequeServices_v0 = {
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
                impact_carbone_kg: 1,
                image_url: 'https://',
              },
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      id: 'user1',
      email: 'email1',
      logement: logement_palaiseau,
      bilbiotheque_services: biblio1,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'user2',
      email: 'email2',
      logement: logement_palaiseau,
      bilbiotheque_services: biblio2,
    });

    // WHEN
    const response = await TestUtil.POST('/services/compute_stats');

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toStrictEqual([ServiceRechercheID.proximite]);

    const stats = await TestUtil.prisma.servicesFavorisStatistique.findMany();
    delete stats[0].created_at;
    delete stats[0].updated_at;
    delete stats[1].created_at;
    delete stats[1].updated_at;
    expect(stats).toStrictEqual([
      {
        count_favoris: 2,
        favoris_id: '123',
        service_id: 'proximite',
        titre_favoris: 'haha',
      },
      {
        count_favoris: 1,
        favoris_id: '456',
        service_id: 'proximite',
        titre_favoris: 'hoho',
      },
    ]);
  });
});
