import { Cron } from '@nestjs/schedule';
import { ServiceRechercheID } from '../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { CategorieRechercheManager } from '../../domain/bibliotheque_services/recherche/categorieRecherche';
import { Injectable } from '@nestjs/common';
import { ServiceExterneID } from '../../domain/bibliotheque_services/serviceExterneID';
import { generateFishUrlForCurrentMonth } from '../../domain/bibliotheque_services/poissonsDeSaisonUrlsGenerator';
import { NewServiceDefinition } from '../../domain/bibliotheque_services/newServiceDefinition';

const new_service_catalogue = require('./new_service_catalogue_data');

@Injectable()
export class NewServiceCatalogue {
  constructor() {
    this.refreshCatalogue();
  }

  public getCatalogue(): NewServiceDefinition[] {
    return new_service_catalogue;
  }
  @Cron('0 * * * *')
  private refreshCatalogue() {
    for (const service_def of new_service_catalogue) {
      if (service_def.id === ServiceRechercheID.fruits_legumes) {
        service_def.sous_titre = CategorieRechercheManager.getMoisCourant();
      }
      if (service_def.id === ServiceExterneID.poisson_de_saison) {
        service_def.external_url = generateFishUrlForCurrentMonth(
          new Date().getMonth(),
        );
      }
    }
  }
}
