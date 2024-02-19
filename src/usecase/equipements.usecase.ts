import { Injectable } from '@nestjs/common';
import { Vehicule } from 'src/domain/equipements/vehicule';
import { VehiculeAPI } from '../../src/infrastructure/api/types/equipements/vehiculeAPI';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class EquipementUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async ajouterVehicule(utilisateurId: string, payload: VehiculeAPI) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const vehicule = VehiculeAPI.toDomain(payload);

    utilisateur.equipements.addVehicule(vehicule);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
  async listerVehicules(utilisateurId: string): Promise<Vehicule[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    return utilisateur.equipements.vehicules;
  }
}
