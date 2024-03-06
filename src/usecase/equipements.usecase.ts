import { Injectable } from '@nestjs/common';
import { Vehicule } from '../../src/domain/equipements/vehicule';
import { VehiculeAPI } from '../../src/infrastructure/api/types/equipements/vehiculeAPI';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class EquipementUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private nGCCalculator: NGCCalculator,
  ) {}

  async ajouterVehicule(utilisateurId: string, payload: VehiculeAPI) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const vehicule = VehiculeAPI.toDomain(payload);

    utilisateur.equipements.addVehicule(vehicule);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async calculerImpact(payload: VehiculeAPI): Promise<number> {
    const situation = {
      'transport . voiture . gabarit': { valeur: payload.gabarit },
    };
    const entry = 'transport . voiture . empreinte moyenne';

    const result = this.nGCCalculator.computeSingleEntryValue(situation, entry);

    return 10;
  }

  async listerVehicules(utilisateurId: string): Promise<Vehicule[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    return utilisateur.equipements.vehicules;
  }
}
