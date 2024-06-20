import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ServiceRechercheID } from '../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRecherche } from '../../src/domain/bibliotheque_services/resultatRecherche';
import { RechercheServiceManager } from '../../src/domain/bibliotheque_services/serviceManager';

@Injectable()
export class RechercheServicesUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private rechercheServiceManager: RechercheServiceManager,
  ) {}

  async search(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    text: string,
  ): Promise<ResultatRecherche[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const finder = this.rechercheServiceManager.getFinderById(serviceId);

    const result = await finder.find(text);

    return result;
  }
}
