import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ServiceRechercheID } from '../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRecherche } from '../../src/domain/bibliotheque_services/resultatRecherche';
import { RechercheServiceManager } from '../../src/domain/bibliotheque_services/serviceManager';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { FiltreRecherche } from '../domain/bibliotheque_services/filtreRecherche';
import {
  CategorieRecherche,
  CategorieRechercheManager,
} from '../domain/bibliotheque_services/categorieRecherche';
import { ServiceFavorisStatistiqueRepository } from '../infrastructure/repository/serviceFavorisStatistique.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { ServiceRechercheDefinition } from '../domain/bibliotheque_services/serviceRechercheDefinition';
import { Univers } from '../domain/univers/univers';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { ServiceExterneID } from '../domain/bibliotheque_services/serviceExterneID';
import { generateFishUrlForCurrentMonth } from "../domain/bibliotheque_services/fruitsEtLegumesDeSaisonUrls";

const CATALOGUE = [
  {
    id: ServiceRechercheID.fruits_legumes,
    external_url: 'https://impactco2.fr/outils/fruitsetlegumes',
    icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/cerise.png',
    titre: 'Fruits et légumes de saison',
    sous_titre: CategorieRechercheManager.getMoisCourant(),
    univers: Univers.alimentation,
    is_available_inhouse: true,
  },
  {
    id: ServiceRechercheID.proximite,
    external_url: 'https://presdecheznous.fr/map#/carte/{CODE_POSTAL}',
    icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/commerce.png',
    titre: 'Mes commerces de proximité',
    sous_titre: 'À {COMMUNE}',
    univers: Univers.alimentation,
    is_available_inhouse: true,
  },
  {
    id: ServiceRechercheID.recettes,
    external_url:
      'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/recettes',
    icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/omelette.png',
    titre: 'Recettes saines et équilibrées',
    sous_titre: 'Bas carbone',
    univers: Univers.alimentation,
    is_available_inhouse: true,
  },
  {
    id: ServiceExterneID.poisson_de_saison,
    external_url: generateFishUrlForCurrentMonth(new Date().getMonth()),
    icon_url:
      'https://www.mangerbouger.fr/var/mb/storage/images/_aliases/reference/9/9/9/1/11999-1-eng-GB/Poissons@3x.png',
    titre: 'Poissons de saison',
    sous_titre: 'Manger Bouger',
    univers: Univers.alimentation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.compost_local,
    external_url: 'https://reseaucompost.org/annuaire/geocompost-la-carte',
    icon_url: 'https://reseaucompost.org/themes/custom/rcc/logo.svg',
    titre: 'Où composter proche de chez moi ?',
    sous_titre: 'Réseau Compost Citoyen',
    univers: Univers.alimentation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.changer_voiture,
    external_url:
      'https://jechangemavoiture.gouv.fr/jcmv/simulateur/#/vehicule',
    icon_url:
      'https://jechangemavoiture.gouv.fr/jcmv/simulateur/assets/img/marianne-64.png',
    titre: 'Quel véhicule pour remplacer le mien ?',
    sous_titre: 'Je change ma voiture',
    univers: Univers.transport,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.velo_tourisme,
    external_url: 'https://www.francevelotourisme.com/itineraire',
    icon_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Logo_France_V%C3%A9lo_Tourisme.jpg/320px-Logo_France_V%C3%A9lo_Tourisme.jpg',
    titre: 'Voyager à vélo en France',
    sous_titre: 'France vélo tourisme',
    univers: Univers.transport,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.bornes_elec,
    external_url: 'https://abetterrouteplanner.com/',
    icon_url:
      'https://abetterrouteplanner.com/static/media/abrp_icon_round.388cd679ba52e719ddd4.png',
    titre: 'Où trouver des bornes électriques sur mes trajets ?',
    sous_titre: 'A better route planner',
    univers: Univers.transport,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.impact_co2,
    external_url: 'https://impactco2.fr/outils/comparateur',
    icon_url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3d/Logo_Impact_CO2.svg/320px-Logo_Impact_CO2.svg.png',
    titre: 'Comparateur carbone',
    sous_titre: 'Impact CO2',
    univers: Univers.climat,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.je_veux_aider,
    external_url: 'https://www.jeveuxaider.gouv.fr/missions-benevolat',
    icon_url:
      'https://www.jeveuxaider.gouv.fr/_nuxt/jeveuxaider-logo.5c6a563b.svg',
    titre: 'Devenir bénévole',
    sous_titre: 'Je veux aider',
    univers: Univers.climat,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.aide_reno,
    external_url: 'https://mesaidesreno.beta.gouv.fr/',
    icon_url:
      'https://mesaidesreno.beta.gouv.fr/_next/static/media/logo.6655b6e6.svg',
    titre: 'Estimer mes aides à la rénovation',
    sous_titre: 'Mes Aides Reno',
    univers: Univers.logement,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.conso_eau,
    external_url:
      'https://www.cieau.com/le-metier-de-leau/usages-consommation-conseils/calculateur-consommation-eau-annuelle/',
    icon_url:
      'https://www.cieau.com/wp-content/themes/understrap-child/img/cieau_logo_header.png',
    titre: `Estimer ma conso d'eau`,
    sous_titre: 'Cieau',
    univers: Univers.logement,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.pacoupas,
    external_url: 'https://pacoupa.ademe.fr/',
    icon_url: 'https://pacoupa.ademe.fr/_next/static/media/hero.849dfaf7.svg',
    titre: `Changer son chauffage`,
    sous_titre: 'Pacoupa',
    univers: Univers.logement,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.chronotrains,
    external_url: 'https://www.chronotrains.com/fr#google_vignette',
    icon_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Logo_train_transilien_black.svg/240px-Logo_train_transilien_black.svg.png',
    titre: `Où partir en train pour les vacances ?`,
    sous_titre: 'Chronotrains',
    univers: Univers.transport,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.reparerabilite,
    external_url:
      'https://epargnonsnosressources.gouv.fr/indice-de-reparabilite/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/09/picto_reparabilite_desktop-115.png',
    titre: `Mon appareil se répare-t-il facilement ?`,
    sous_titre: 'Epargnons nos ressources',
    univers: Univers.consommation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.labels,
    external_url:
      'https://epargnonsnosressources.gouv.fr/labels-environnementaux/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/09/outils_index-des-labels_icon_desktop_115x95.png',
    titre: `Se repérer dans les labels`,
    sous_titre: 'Epargnons nos ressources',
    univers: Univers.consommation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.diagnostiquer,
    external_url:
      'https://epargnonsnosressources.gouv.fr/diagnostic-pannes-appareils/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/10/icons-outils_diagnostique.png',
    titre: `Diagnostiquer une panne`,
    sous_titre: 'Epargnons nos ressources',
    univers: Univers.consommation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.reparer,
    external_url: 'https://epargnonsnosressources.gouv.fr/tutos-reparation/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/09/picto_tutoreparation_desktop_115x95.png',
    titre: `Tutos pour réparer mes objets`,
    sous_titre: 'Epargnons nos ressources',
    univers: Univers.consommation,
    is_available_inhouse: false,
  },
];
@Injectable()
export class RechercheServicesUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private rechercheServiceManager: RechercheServiceManager,
    private serviceFavorisStatistiqueRepository: ServiceFavorisStatistiqueRepository,
    private personnalisator: Personnalisator,
  ) {}

  async search(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

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

    if (serviceId === ServiceRechercheID.proximite) {
      if (!filtre.hasPoint()) {
        if (!utilisateur.logement.code_postal) {
          ApplicationError.throwUnkonwnUserLocation();
        } else {
          filtre.code_postal = utilisateur.logement.code_postal;
          filtre.commune = utilisateur.logement.commune;
        }
      }
    }

    const result = await finder.find(filtre);

    utilisateur.bilbiotheque_services.setDerniereRecherche(serviceId, result);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    this.completeFavorisDataToResult(serviceId, result, utilisateur);

    return result;
  }

  async getResultRechercheDetail(
    utilisateurId: string,
    serviceId: ServiceRechercheID,
    reultatId: string,
  ): Promise<ResultatRecherche> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

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

  async getListServiceDefHome(
    utilisateurId: string,
  ): Promise<ServiceRechercheDefinition[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let result = CATALOGUE.map((c) => new ServiceRechercheDefinition(c));
    result = result.filter((r) => r.is_available_inhouse);

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  async getListServiceDef(
    utilisateurId: string,
    univers: string,
  ): Promise<ServiceRechercheDefinition[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    let result = CATALOGUE.map((c) => new ServiceRechercheDefinition(c));
    result = result.filter((r) => r.univers === univers);

    return this.personnalisator.personnaliser(result, utilisateur);
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
