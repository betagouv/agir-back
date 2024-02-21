import {
  Consommation100km,
  VehiculeType,
  VoitureCarburant,
  VoitureGabarit,
} from '../../../src/domain/equipements/vehicule';
import { VehiculeAPI } from '../../../src/infrastructure/api/types/equipements/vehiculeAPI';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { TestUtil } from '../../TestUtil';

describe('Equipements (API test)', () => {
  const utilisateurRepo = new UtilisateurRepository(TestUtil.prisma);
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

  it('GET /utilisateurs/:utilisateurId/vehicules listes 1 vehicule avec bonne data', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/vehicules',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);

    const vehicule = response.body[0];

    expect(vehicule.nom).toEqual('titine');
    expect(vehicule.carburant).toEqual(VoitureCarburant.E85);
    expect(vehicule.a_plus_de_10_ans).toEqual(true);
    expect(vehicule.est_en_autopartage).toEqual(false);
    expect(vehicule.conso_100_km).toEqual(Consommation100km.entre_5_10L);
    expect(vehicule.gabarit).toEqual(VoitureGabarit.berline);
    expect(vehicule.type).toEqual(VehiculeType.voiture);
  });
  it(`POST /vehicules/calculer_impact calcul l'impact CO2 du payload`, async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const payload: VehiculeAPI = {
      nom: 'titine',
      carburant: VoitureCarburant.E85,
      a_plus_de_10_ans: true,
      est_en_autopartage: false,
      conso_100_km: Consommation100km.entre_5_10L,
      gabarit: VoitureGabarit.berline,
      type: VehiculeType.voiture,
    };
    // WHEN
    const response = await TestUtil.POST('/vehicules/calculer_impact').send(
      payload,
    );

    // THEN
    expect(response.status).toBe(201);
    expect(response.body.grammes_co2).toBe(10);
  });
  it('PUT /utilisateurs/:utilisateurId/vehicules/toto ajoute un vehicule au nom de toto', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    const payload: VehiculeAPI = {
      type: VehiculeType.camping_car,
      a_plus_de_10_ans: false,
      est_en_autopartage: true,
      carburant: VoitureCarburant.E5_E10,
      conso_100_km: Consommation100km.plus_10_L,
      gabarit: VoitureGabarit.VUL,
      nom: undefined,
    };
    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/vehicules/toto',
    ).send(payload);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepo.getById('utilisateur-id');

    expect(userDB.equipements.vehicules).toHaveLength(2);
    const vehiculeDB = userDB.equipements.getVehiculeParNom('toto');
    expect(vehiculeDB.type).toEqual(VehiculeType.camping_car);
    expect(vehiculeDB.a_plus_de_10_ans).toEqual(false);
    expect(vehiculeDB.est_en_autopartage).toEqual(true);
    expect(vehiculeDB.carburant).toEqual(VoitureCarburant.E5_E10);
    expect(vehiculeDB.conso_100_km).toEqual(Consommation100km.plus_10_L);
    expect(vehiculeDB.gabarit).toEqual(VoitureGabarit.VUL);
  });
  it('PUT /utilisateurs/:utilisateurId/vehicules/toto ecrase un vehicule au nom de titine', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    const payload: VehiculeAPI = {
      type: VehiculeType.camping_car,
      a_plus_de_10_ans: false,
      est_en_autopartage: true,
      carburant: VoitureCarburant.E5_E10,
      conso_100_km: Consommation100km.plus_10_L,
      gabarit: VoitureGabarit.VUL,
      nom: undefined,
    };
    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/vehicules/titine',
    ).send(payload);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepo.getById('utilisateur-id');

    expect(userDB.equipements.vehicules).toHaveLength(1);

    const vehiculeDB = userDB.equipements.getVehiculeParNom('titine');
    expect(vehiculeDB.type).toEqual(VehiculeType.camping_car);
    expect(vehiculeDB.a_plus_de_10_ans).toEqual(false);
    expect(vehiculeDB.est_en_autopartage).toEqual(true);
    expect(vehiculeDB.carburant).toEqual(VoitureCarburant.E5_E10);
    expect(vehiculeDB.conso_100_km).toEqual(Consommation100km.plus_10_L);
    expect(vehiculeDB.gabarit).toEqual(VoitureGabarit.VUL);
  });
});
