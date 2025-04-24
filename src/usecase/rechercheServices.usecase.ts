import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { NewServiceDefinition } from '../domain/bibliotheque_services/newServiceDefinition';
import { CategorieRecherche } from '../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../domain/bibliotheque_services/recherche/filtreRecherche';
import { RechercheServiceManager } from '../domain/bibliotheque_services/recherche/rechercheServiceManager';
import { ResultatRecherche } from '../domain/bibliotheque_services/recherche/resultatRecherche';
import { ServiceRechercheID } from '../domain/bibliotheque_services/recherche/serviceRechercheID';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { ServiceFavorisStatistiqueRepository } from '../infrastructure/repository/serviceFavorisStatistique.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { NewServiceCatalogue } from './referentiels/newServiceCatalogue';

@Injectable()
export class RechercheServicesUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private rechercheServiceManager: RechercheServiceManager,
    private serviceFavorisStatistiqueRepository: ServiceFavorisStatistiqueRepository,
    private personnalisator: Personnalisator,
    private newServiceCatalogue: NewServiceCatalogue,
  ) {}

  async search(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    filtre: FiltreRecherche,
  ): Promise<{
    liste: ResultatRecherche[];
    encore_plus_resultats_dispo: boolean;
  }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.bilbiotheque_services, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const finder = this.rechercheServiceManager.getFinderById(serviceId);

    if (!finder) {
      ApplicationError.throwUnkonwnSearchService(serviceId);
    }

    if (
      filtre.categorie &&
      !finder.getManagedCategories().includes(filtre.categorie)
    ) {
      ApplicationError.throwUnkonwnCategorieForSearchService(
        serviceId,
        filtre.categorie,
      );
    }

    if (
      serviceId === ServiceRechercheID.proximite ||
      serviceId === ServiceRechercheID.longue_vie_objets
    ) {
      if (!filtre.hasPoint()) {
        if (!utilisateur.logement.code_postal) {
          ApplicationError.throwUnkonwnUserLocation();
        } else {
          filtre.code_postal = utilisateur.logement.code_postal;
          filtre.commune = utilisateur.logement.commune;
        }
      }
    }
    if (!filtre.code_commune) {
      filtre.code_commune = utilisateur.code_commune;
    }

    const result = await finder.find(filtre);

    utilisateur.bilbiotheque_services.setDerniereRecherche(serviceId, result);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.bilbiotheque_services],
    );

    this.completeFavorisDataToResult(serviceId, result, utilisateur);

    let encore_plus_resultats_dispo: boolean;
    let max_resultat: number;

    if (result.length > 0 && result[0].nbr_resultats_max_dispo) {
      max_resultat = result[0].nbr_resultats_max_dispo;
    } else {
      max_resultat = finder.getMaxResultOfCategorie(filtre.categorie);
    }

    encore_plus_resultats_dispo = result.length < max_resultat;

    return {
      liste: result,
      encore_plus_resultats_dispo: encore_plus_resultats_dispo,
    };
  }

  async getResultRechercheDetail(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    reultatId: string,
  ): Promise<ResultatRecherche> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.bilbiotheque_services],
    );
    Utilisateur.checkState(utilisateur);

    const service = utilisateur.bilbiotheque_services.getServiceById(serviceId);

    if (!service) {
      ApplicationError.throwUnkonwnSearchService(serviceId);
    }

    const result = service.getLastResultatById(reultatId);

    if (!result) {
      ApplicationError.throwUnkonwnSearchResult(serviceId, reultatId);
    }

    this.completeFavorisDataToResult(serviceId, [result], utilisateur);

    return result;
  }

  async ajouterFavoris(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    favId: string,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.bilbiotheque_services],
    );
    Utilisateur.checkState(utilisateur);

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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.bilbiotheque_services],
    );
    Utilisateur.checkState(utilisateur);

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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.bilbiotheque_services],
    );
    Utilisateur.checkState(utilisateur);

    const service = utilisateur.bilbiotheque_services.getServiceById(serviceId);
    if (!service) {
      return [];
    }

    const result = service.favoris.map((f) => f.resulat_recherche);

    this.completeFavorisDataToResult(serviceId, result, utilisateur);

    return result;
  }

  async getListServiceDefHome(
    utilisateurId: string,
  ): Promise<NewServiceDefinition[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let result = this.newServiceCatalogue.getCatalogue();
    result = result.filter((r) => r.is_available_inhouse);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async getListServicesOfThematique(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<NewServiceDefinition[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let result = this.newServiceCatalogue.getCatalogue();
    result = result.filter((r) => r.thematique === thematique);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async getCategories(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
  ): Promise<CategorieRecherche[]> {
    const finder = this.rechercheServiceManager.getFinderById(serviceId);
    if (!finder) {
      ApplicationError.throwUnkonwnSearchService(serviceId);
    }

    return finder.getManagedCategories();
  }

  public async computeStatsFavoris(): Promise<string[]> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds(
      {},
    );

    const service_favoris_map: Map<
      string,
      Map<string, { count: number; titre: string }>
    > = new Map();

    for (const user_id of user_id_liste) {
      const user = await this.utilisateurRepository.getById(user_id, [
        Scope.bilbiotheque_services,
      ]);

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
