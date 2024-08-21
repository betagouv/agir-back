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

  it(`POST /utlilisateur/id/recherche_services/proximite/search renvoie les bonnes données`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ rayon_metres: 1000, nombre_max_resultats: 1 });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toStrictEqual({
      adresse_code_postal: '91120',
      adresse_nom_ville: 'Palaiseau',
      adresse_rue: '4 Rue des Écoles',
      distance_metres: 814,
      est_favoris: false,
      id: 'DwG',
      nombre_favoris: 0,
      site_web: 'https://www.monepi.fr/monepicerit',
      titre: "Mon Epice'Rit",
      image_url: null,
      categories: [
        'Alimentation et Agriculture',
        'Association',
        'Éducation et Formation',
        'Épicerie & Supérette',
        'Sensibilisation grand public',
        'Point de Distribution',
        'Ateliers',
        'Autre réseau',
        'Adulte',
        'Adolescence',
        'Enfance',
        'Nature / Environnement',
      ],
      commitment:
        "Gouvernance participative, Produits respectueux de l'environnement, Prix justes",
      description: 'Epicerie Participative, Ecologique et Solidaire',
      open_hours: [],
    });
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search renvoie les images`, async () => {
    // GIVEN
    const logement_dijon: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91400',
      chauffage: Chauffage.bois,
      commune: 'ORSAY',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement_dijon });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ rayon_metres: 2000, nombre_max_resultats: 10 });

    // THEN
    expect(response.status).toBe(201);

    expect(response.body[0].image_url).toEqual(
      'https://presdecheznous.fr/uploads/images/elements/printemps/2017/06/11717_Ecole-innovante-Saclay-1.jpg',
    );
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search renvoie une liste de résultats par distance croissante`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ rayon_metres: 1000 });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(4);

    expect(response.body[0].titre).toEqual(`Mon Epice'Rit`);
    expect(response.body[1].titre).toEqual(`L'ébullition`);
    expect(response.body[2].titre).toEqual(`L’Auvergnat Bio`);
    expect(response.body[3].titre).toEqual(`Le Verger de Sylvestre `);
    expect(response.body[0].distance_metres).toEqual(814);
    expect(response.body[1].distance_metres).toEqual(829);
    expect(response.body[2].distance_metres).toEqual(922);
    expect(response.body[3].distance_metres).toEqual(971);

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services).toHaveLength(1);
    expect(userDB.bilbiotheque_services.liste_services[0].id).toEqual(
      ServiceRechercheID.proximite,
    );
    expect(
      userDB.bilbiotheque_services.liste_services[0].derniere_recherche,
    ).toHaveLength(4);
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search prend en compte un point GPS argument`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({
      rayon_metres: 1000,
      longitude: 2.20697928187562,
      latitude: 48.70358115101862,
      nombre_max_resultats: 1,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(1);

    expect(response.body[0].titre).toEqual(`Epigénie`);
    expect(response.body[0].distance_metres).toEqual(827);
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search rayon de 10km par défaut`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ nombre_max_resultats: 1000 });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body.length).toBeGreaterThan(200);
  });
  it(`POST /utlilisateur/id/recherche_services/proximite/search petit rayon => moins de résultats`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({
      rayon_metres: 800,
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
      categorie: CategorieRecherche.epicerie_superette,
      rayon_metres: 1000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
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

  it(`POST /utlilisateur/id/recherche_services/proximite/last_results/id/add_to_favoris  ajoute au favoris suite à la dernière recherche`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ rayon_metres: 1000 });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(4);
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

  it(`POST /utlilisateur/id/recherche_services/proximite/last_results/id/add_to_favoris  ajoute 2 fois en favoris ne fait qu'un favoris`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ rayon_metres: 1000 });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(4);
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
  it(`POST /services/compute_stats  calcul les stats d'uun utilisateur avec 2 favoris`, async () => {
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
  it(`POST /utlilisateur/id/recherche_services/proximite/search  tags les favoris dans le recherche`, async () => {
    // GIVEN
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
                id: 'DwG',
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
            {
              date_ajout: new Date(),
              resulat_recherche: {
                id: 'NTw',
                adresse_code_postal: 'a',
                adresse_nom_ville: 'b',
                adresse_rue: 'c',
                latitude: 1,
                longitude: 2,
                site_web: 'e',
                titre: 'hoho',
                impact_carbone_kg: 1,
                image_url: 'https://',
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
                id: 'DwG',
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
      logement: logement_palaiseau,
      bilbiotheque_services: biblio1,
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'user2',
      email: 'email2',
      logement: logement_palaiseau,
      bilbiotheque_services: biblio2,
    });

    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.POST('/services/compute_stats');

    await serviceFavorisStatistiqueRepository.loadCachedData();

    await TestUtil.generateAuthorizationToken('utilisateur-id');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/proximite/search',
    ).send({ rayon_metres: 1000 });

    // THEN
    expect(response.status).toBe(201);

    expect(response.body[0].id).toEqual('DwG');
    expect(response.body[0].est_favoris).toEqual(true);
    expect(response.body[0].nombre_favoris).toEqual(2);
    expect(response.body[1].id).toEqual('NTw');
    expect(response.body[1].est_favoris).toEqual(true);
    expect(response.body[1].nombre_favoris).toEqual(1);
    expect(response.body[2].id).toEqual('D3U');
    expect(response.body[2].est_favoris).toEqual(false);
    expect(response.body[2].nombre_favoris).toEqual(0);
  });

  it(`POST /utlilisateur/id/recherche_services/impact_transports/search renvoie une liste de résultats pour recherche par distance`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    process.env.BASE_URL_FRONT = 'https://site';

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/impact_transports/search',
    ).send({
      distance_metres: 10000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(20);
    expect(response.body[0]).toStrictEqual({
      est_favoris: false,
      id: '7',
      impact_carbone_kg: 0,
      nombre_favoris: 0,
      titre: 'Vélo ou marche',
      distance_metres: 10000,
      image_url: 'https://site/impact_co2_img_transports/velo.svg',
    });
  });

  it(`POST /utlilisateur/id/recherche_services/impact_transports/search renvoie une liste de résultats`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    process.env.BASE_URL_FRONT = 'https://site';

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/impact_transports/search',
    ).send({
      latitude_depart: 48.70367966010218,
      longitude_depart: 2.2070299356648193,
      latitude_arrivee: 48.70982333858675,
      longitude_arrivee: 2.2109083863527776,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(16);
    expect(response.body[0]).toStrictEqual({
      est_favoris: false,
      id: '7',
      impact_carbone_kg: 0,
      nombre_favoris: 0,
      titre: 'Vélo ou marche',
      distance_metres: 1141,
      image_url: 'https://site/impact_co2_img_transports/velo.svg',
    });
    expect(response.body[15]).toStrictEqual({
      est_favoris: false,
      id: '4',
      impact_carbone_kg: 0.533568,
      nombre_favoris: 0,
      titre: 'Voiture thermique',
      distance_metres: 2779,
      image_url: 'https://site/impact_co2_img_transports/voiturethermique.svg',
    });
  });

  it(`POST /utlilisateur/id/recherche_services/fruits_legumes/search renvoie une liste de résultats`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });
    process.env.BASE_URL_FRONT = 'https://site';

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/fruits_legumes/search',
    ).send({ categorie: 'janvier' });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(36);
    expect(response.body[0]).toStrictEqual({
      est_favoris: false,
      id: 'poire',
      impact_carbone_kg: 0.36428259399999996,
      nombre_favoris: 0,
      titre: 'Poire',
      emoji: '🍐',
      type_fruit_legume: FruitLegume.fruit,
      image_url: 'https://site/impact_co2_img_fruits_legumes/poire.svg',
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services).toHaveLength(1);
    expect(userDB.bilbiotheque_services.liste_services[0].id).toEqual(
      ServiceRechercheID.fruits_legumes,
    );
    expect(
      userDB.bilbiotheque_services.liste_services[0].derniere_recherche,
    ).toHaveLength(36);
  });
  it(`POST /utlilisateur/id/recherche_services/fruits_legumes/search renvoie une liste de résultats si pas de categorie`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/fruits_legumes/search',
    );

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(33);
    expect(response.body[0]).toStrictEqual({
      est_favoris: false,
      id: 'ail',
      impact_carbone_kg: 0.358042894,
      nombre_favoris: 0,
      titre: 'Ail',
      emoji: '🌱',
      type_fruit_legume: 'legume',
      image_url: '/impact_co2_img_fruits_legumes/ail.svg',
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services).toHaveLength(1);
    expect(userDB.bilbiotheque_services.liste_services[0].id).toEqual(
      ServiceRechercheID.fruits_legumes,
    );
    expect(
      userDB.bilbiotheque_services.liste_services[0].derniere_recherche,
    ).toHaveLength(33);
  });
  it(`POST /utlilisateur/id/recherche_services/recettes/search renvoie une liste de résultats`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { logement: logement_palaiseau });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/recherche_services/recettes/search',
    ).send({ categorie: 'vege' });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(10);
    expect(response.body[0].difficulty_plat).toEqual('Facile');
    expect(response.body[0].est_favoris).toEqual(false);
    expect(response.body[0].id).toEqual('10982');
    expect(response.body[0].nombre_favoris).toEqual(0);
    expect(response.body[0].temps_prepa_min).toEqual(5);
    expect(response.body[0].titre).toEqual(
      'Salade de pâtes complètes et lentilles',
    );
    expect(response.body[0].type_plat).toEqual('PLC_HVOP/FEC-COMPL/LGS');

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.bilbiotheque_services.liste_services).toHaveLength(1);
    expect(userDB.bilbiotheque_services.liste_services[0].id).toEqual(
      ServiceRechercheID.recettes,
    );
    expect(
      userDB.bilbiotheque_services.liste_services[0].derniere_recherche,
    ).toHaveLength(10);
  });
});
