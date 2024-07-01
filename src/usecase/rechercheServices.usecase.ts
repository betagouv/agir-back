import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ServiceRechercheID } from '../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRecherche } from '../../src/domain/bibliotheque_services/resultatRecherche';
import { RechercheServiceManager } from '../../src/domain/bibliotheque_services/serviceManager';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { FiltreRecherche } from '../domain/bibliotheque_services/filtreRecherche';
import { CategorieRecherche } from '../domain/bibliotheque_services/categorieRecherche';
import { ServiceFavorisStatistiqueRepository } from '../infrastructure/repository/serviceFavorisStatistique.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';

@Injectable()
export class RechercheServicesUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private rechercheServiceManager: RechercheServiceManager,
    private serviceFavorisStatistiqueRepository: ServiceFavorisStatistiqueRepository,
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
    if (
      serviceId === ServiceRechercheID.proximite &&
      !utilisateur.logement.code_postal
    ) {
      ApplicationError.throwUnkonwnUserLocation();
    }

    if (categorie && !CategorieRecherche[categorie]) {
      ApplicationError.throwUnkonwnCategorie(categorie);
    }

    if (
      categorie &&
      !finder.getManagedCategories().includes(CategorieRecherche[categorie])
    ) {
      ApplicationError.throwUnkonwnCategorieForSearchService(
        serviceId,
        categorie,
      );
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

    this.completeFavorisDataToResult(serviceId, result, utilisateur);

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

    const result = service.favoris.map((f) => f.resulat_recherche);

    this.completeFavorisDataToResult(serviceId, result, utilisateur);

    return result;
  }

  async getCategories(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
  ): Promise<CategorieRecherche[]> {
    const finder = this.rechercheServiceManager.getFinderById(serviceId);

    return finder.getManagedCategories();
  }

  public async computeStatsFavoris(): Promise<string[]> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds();

    const service_favoris_map: Map<
      string,
      Map<string, { count: number; titre: string }>
    > = new Map();

    for (const user_id of user_id_liste) {
      const user = await this.utilisateurRepository.getById(user_id);

      for (const service of user.bilbiotheque_services.liste_services) {
        for (const favoris of service.favoris) {
          if (!service_favoris_map.get(service.id)) {
            service_favoris_map.set(service.id, new Map());
          }

          const service_map = service_favoris_map.get(service.id);

          if (!service_map.get(favoris.resulat_recherche.id)) {
            service_map.set(favoris.resulat_recherche.id, {
              count: 1,
              titre: favoris.resulat_recherche.titre,
            });
          } else {
            const fav = service_map.get(favoris.resulat_recherche.id);
            fav.count++;
          }
        }
      }
    }

    const result = [];

    for (const [service_id, favoris_map] of service_favoris_map) {
      result.push(service_id);

      for (const [favoris_id, favoris] of favoris_map) {
        await this.serviceFavorisStatistiqueRepository.upsertStatistiques(
          service_id,
          favoris_id,
          favoris.titre,
          favoris.count,
        );
      }
    }

    return result;
  }

  private completeFavorisDataToResult(
    service_id: ServiceRechercheID,
    result: ResultatRecherche[],
    utilisateur: Utilisateur,
  ) {
    const service =
      utilisateur.bilbiotheque_services.getServiceById(service_id);

    for (const item of result) {
      item.est_favoris = service.estFavoris(item.id);
      item.nombre_favoris = ServiceFavorisStatistiqueRepository.getFavorisCount(
        service_id,
        item.id,
      );
    }
  }
}
