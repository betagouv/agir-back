import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ServiceRechercheID } from '../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRecherche } from '../../src/domain/bibliotheque_services/resultatRecherche';
import { RechercheServiceManager } from '../../src/domain/bibliotheque_services/serviceManager';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { FiltreRecherche } from '../domain/bibliotheque_services/filtreRecherche';
import { CategorieRecherche } from '../domain/bibliotheque_services/categorieRecherche';

@Injectable()
export class RechercheServicesUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private rechercheServiceManager: RechercheServiceManager,
  ) {}

  async search(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    categorie: string,
    rayon_metres: number,
    nombre_max_resultats: number,
  ): Promise<ResultatRecherche[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const finder = this.rechercheServiceManager.getFinderById(serviceId);

    if (!finder) {
      ApplicationError.throwUnkonwnSearchService(serviceId);
    }
    if (!utilisateur.logement.code_postal) {
      ApplicationError.throwUnkonwnUserLocation();
    }

    const result = await finder.find(
      new FiltreRecherche({
        categorie: CategorieRecherche[categorie],
        code_postal: utilisateur.logement.code_postal,
        commune: utilisateur.logement.commune,
        rayon_metres: rayon_metres,
        nombre_max_resultats: nombre_max_resultats,
      }),
    );

    utilisateur.bilbiotheque_services.setDerniereRecherche(serviceId, result);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return result;
  }

  async ajouterFavoris(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    favId: string,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const service = utilisateur.bilbiotheque_services.getServiceById(serviceId);

    if (!service || service.derniere_recherche.length === 0) {
      ApplicationError.throwUnkonwnSearchResult(serviceId, favId);
    }

    service.ajouterFavoris(favId);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async supprimerFavoris(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    favId: string,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const service = utilisateur.bilbiotheque_services.getServiceById(serviceId);

    if (!service) {
      return;
    }

    service.supprimerFavoris(favId);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getFavoris(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
  ): Promise<ResultatRecherche[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const service = utilisateur.bilbiotheque_services.getServiceById(serviceId);
    if (!service) {
      return [];
    }

    return service.favoris.map((f) => f.resulat_recherche);
  }

  async getCategories(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
  ): Promise<CategorieRecherche[]> {
    const finder = this.rechercheServiceManager.getFinderById(serviceId);

    return finder.getManagedCategories();
  }
}
