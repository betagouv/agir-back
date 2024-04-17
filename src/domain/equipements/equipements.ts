import { Equipements_v0 } from '../object_store/equipement/equipement_v0';
import { Vehicule } from './vehicule';

export class Equipements {
  vehicules: Vehicule[];

  constructor(data?: Equipements_v0) {
    this.reset();

    if (data) {
      if (data.vehicules) {
        data.vehicules.forEach((element) => {
          this.vehicules.push(new Vehicule(element));
        });
      }
    }
  }

  public reset() {
    this.vehicules = [];
  }
  public getVehiculeParNom(nom: string) {
    return this.vehicules.find((e) => e.nom === nom);
  }
  public supprimeVehiculeParNom(nom: string) {
    const vehicule_index = this.vehicules.findIndex((e) => e.nom === nom);
    if (vehicule_index >= 0) {
      this.vehicules.splice(vehicule_index, 1);
    }
  }
  public addVehicule(vehicule: Vehicule) {
    this.supprimeVehiculeParNom(vehicule.nom);
    this.vehicules.push(vehicule);
  }
}
