import { Equipements } from '../../../../src/domain/equipements/equipements';
import {
  Consommation100km,
  Vehicule,
  VehiculeType,
  VoitureCarburant,
  VoitureGabarit,
} from '../../../../src/domain/equipements/vehicule';

describe('Equipements', () => {
  it('addVehicule : ajoute un vehicule OK ', () => {
    // GIVEN
    const equipements = new Equipements();

    // WHEN
    equipements.addVehicule(
      new Vehicule({
        a_plus_de_10_ans: false,
        carburant: VoitureCarburant.E85,
        conso_100_km: Consommation100km.entre_5_10L,
        est_en_autopartage: false,
        gabarit: VoitureGabarit.berline,
        nom: 'titine',
        type: VehiculeType.voiture,
      }),
    );

    // THEN
    expect(equipements.vehicules).toHaveLength(1);
  });
  it('getVehiculeParNom : renvoi le bon vehicule ', () => {
    // GIVEN
    const equipements = new Equipements();

    equipements.addVehicule(
      new Vehicule({
        a_plus_de_10_ans: false,
        carburant: VoitureCarburant.E85,
        conso_100_km: Consommation100km.entre_5_10L,
        est_en_autopartage: false,
        gabarit: VoitureGabarit.berline,
        nom: 'titine',
        type: VehiculeType.voiture,
      }),
    );
    equipements.addVehicule(
      new Vehicule({
        a_plus_de_10_ans: false,
        carburant: undefined,
        conso_100_km: undefined,
        est_en_autopartage: false,
        gabarit: undefined,
        nom: 'trote',
        type: VehiculeType.trottinette,
      }),
    );

    // WHEN
    const result = equipements.getVehiculeParNom('trote');

    // THEN
    expect(result.nom).toEqual('trote');
  });
  it('supprimeVehiculeParNom : supprime un vehicule par nom OK ', () => {
    // GIVEN
    const equipements = new Equipements();

    equipements.addVehicule(
      new Vehicule({
        a_plus_de_10_ans: false,
        carburant: VoitureCarburant.E85,
        conso_100_km: Consommation100km.entre_5_10L,
        est_en_autopartage: false,
        gabarit: VoitureGabarit.berline,
        nom: 'titine',
        type: VehiculeType.voiture,
      }),
    );
    equipements.addVehicule(
      new Vehicule({
        a_plus_de_10_ans: false,
        carburant: undefined,
        conso_100_km: undefined,
        est_en_autopartage: false,
        gabarit: undefined,
        nom: 'trote',
        type: VehiculeType.trottinette,
      }),
    );

    // WHEN
    equipements.supprimeVehiculeParNom('trote');

    // THEN
    expect(equipements.vehicules).toHaveLength(1);
    expect(equipements.vehicules[0].nom).toEqual('titine');
  });
  it(`supprimeVehiculeParNom :  pas d'erreur si nom inconnu `, () => {
    // GIVEN
    const equipements = new Equipements();

    equipements.addVehicule(
      new Vehicule({
        a_plus_de_10_ans: false,
        carburant: VoitureCarburant.E85,
        conso_100_km: Consommation100km.entre_5_10L,
        est_en_autopartage: false,
        gabarit: VoitureGabarit.berline,
        nom: 'titine',
        type: VehiculeType.voiture,
      }),
    );

    // WHEN
    equipements.supprimeVehiculeParNom('bip');

    // THEN
    expect(equipements.vehicules).toHaveLength(1);
  });
});
