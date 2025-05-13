import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { NiveauRisqueLogement } from '../../../src/domain/logement/NiveauRisque';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { RisquesNaturelsCommunesRepository } from '../../../src/infrastructure/repository/risquesNaturelsCommunes.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Risques (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const risquesNaturelsCommunesRepository =
    new RisquesNaturelsCommunesRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
  });

  it('GET /utilisateurs/id/risques_commune utilisateur sans code commune => erreur', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      risques: undefined,
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_commune',
    );

    // THEN
    expect(response.status).toBe(400);
  });
  it('GET /utilisateurs/id/risques_commune utilisateur  avec les infos en cache BDD', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: '91477',
      risques: undefined,
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.risquesNaturelsCommunes, {
      code_commune: '91477',
    });
    await risquesNaturelsCommunesRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_commune',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code_commune: '91477',
      nom_commune: 'city',
      nombre_catastrophes_naturels: 44,
      pourcentage_commune_risque_inondation: 80,
      pourcentage_commune_risque_secheresse_geotechnique: 42,
    });
  });
  it('GET /utilisateurs/id/risques_commune utilisateur  calcul des pourcentages OK', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: '91477',
      risques: undefined,
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.risquesNaturelsCommunes, {
      code_commune: '91477',

      surface_totale: 100,
      inondation_surface_zone1: 10,
      inondation_surface_zone2: 10,
      inondation_surface_zone3: 10,
      inondation_surface_zone4: 10,
      inondation_surface_zone5: 10,
      secheresse_surface_zone3: 2,
      secheresse_surface_zone4: 3,
      secheresse_surface_zone5: 5,
    });
    await risquesNaturelsCommunesRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_commune',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code_commune: '91477',
      nom_commune: 'city',
      nombre_catastrophes_naturels: 44,
      pourcentage_commune_risque_inondation: 60,
      pourcentage_commune_risque_secheresse_geotechnique: 10,
    });
  });
  it('GET /utilisateurs/id/risques_commune utilisateur  force la commune via query param', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: '91477',
      risques: undefined,
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await risquesNaturelsCommunesRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_commune?code_commune=21231',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code_commune: '21231',
      nom_commune: 'Dijon',
      nombre_catastrophes_naturels: 0,
      pourcentage_commune_risque_inondation: null,
      pourcentage_commune_risque_secheresse_geotechnique: null,
    });
  });

  it(`GET /utilisateurs/id/risques_commune utilisateur  pas de cache, calcul, est mise en cache, cas de test donc pas d'appel API`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: '91477',
      risques: undefined,
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_commune',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code_commune: '91477',
      nom_commune: 'Palaiseau',
      nombre_catastrophes_naturels: 0,
      pourcentage_commune_risque_inondation: null,
      pourcentage_commune_risque_secheresse_geotechnique: null,
    });

    const cacheDB = (
      await TestUtil.prisma.risquesNaturelsCommunes.findMany()
    )[0];
    delete cacheDB.updated_at;
    delete cacheDB.created_at;
    expect(cacheDB).toEqual({
      code_commune: '91477',
      inondation_surface_zone1: null,
      inondation_surface_zone2: null,
      inondation_surface_zone3: null,
      inondation_surface_zone4: null,
      inondation_surface_zone5: null,
      nom_commune: 'Palaiseau',
      nombre_cat_nat: 0,
      secheresse_surface_zone1: null,
      secheresse_surface_zone2: null,
      secheresse_surface_zone3: null,
      secheresse_surface_zone4: null,
      secheresse_surface_zone5: null,
      surface_totale: null,
    });
  });

  it('GET /utilisateurs/id/risques_adresse utilisateur sans coordonnnées GPS => erreur', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      risques: undefined,
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_adresse',
    );

    // THEN
    expect(response.status).toBe(400);
  });
  it('GET /utilisateurs/id/risques_adresse utilisateur OK, utilisation du cache', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: 10,
      longitude: 12,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      risques: undefined,
      score_risques_adresse: {
        argile: NiveauRisqueLogement.faible,
        inondation: NiveauRisqueLogement.fort,
        radon: NiveauRisqueLogement.inconnu,
        secheresse: NiveauRisqueLogement.moyen,
        seisme: NiveauRisqueLogement.nul,
        submersion: NiveauRisqueLogement.tres_faible,
        tempete: NiveauRisqueLogement.tres_fort,
      },
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_adresse',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        niveau_risque: 'moyen',
        titre: 'Risques de sécheresse',
        type_risque: 'secheresse',
      },
      {
        niveau_risque: 'nul',
        titre: 'Risques sismiques',
        type_risque: 'seisme',
      },
      {
        niveau_risque: 'fort',
        titre: "Risques d'inondations",
        type_risque: 'inondation',
      },
      {
        niveau_risque: 'inconnu',
        titre: "Risques d'exposition au radon",
        type_risque: 'radon',
      },
      {
        niveau_risque: 'tres_faible',
        titre: 'Risques de submersion',
        type_risque: 'submersion',
      },
      {
        niveau_risque: 'tres_fort',
        titre: 'Risques de tempêtes',
        type_risque: 'tempete',
      },
      {
        niveau_risque: 'faible',
        titre: 'Risques retrait-gonflement des sols argileux',
        type_risque: 'argile',
      },
    ]);
  });
  it('GET /utilisateurs/id/risques_adresse usage query param pour les coordonnées', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      latitude: 10,
      longitude: 12,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      risques: undefined,
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/risques_adresse?longitude=30&latitude=40',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        niveau_risque: 'inconnu',
        titre: 'Risques de sécheresse',
        type_risque: 'secheresse',
      },
      {
        niveau_risque: 'inconnu',
        titre: 'Risques sismiques',
        type_risque: 'seisme',
      },
      {
        niveau_risque: 'inconnu',
        titre: "Risques d'inondations",
        type_risque: 'inondation',
      },
      {
        niveau_risque: 'inconnu',
        titre: "Risques d'exposition au radon",
        type_risque: 'radon',
      },
      {
        niveau_risque: 'inconnu',
        titre: 'Risques de submersion',
        type_risque: 'submersion',
      },
      {
        niveau_risque: 'inconnu',
        titre: 'Risques de tempêtes',
        type_risque: 'tempete',
      },
      {
        niveau_risque: 'inconnu',
        titre: 'Risques retrait-gonflement des sols argileux',
        type_risque: 'argile',
      },
    ]);
  });
});
