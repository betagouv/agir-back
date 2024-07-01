import { Injectable } from '@nestjs/common';
import { FruitsLegumesRepository } from '../../infrastructure/repository/services_recherche/fruitsLegumes.repository';
import { PresDeChezNousRepository } from '../../infrastructure/repository/services_recherche/pres_de_chez_nous/presDeChezNous.repository';
import { RecettesRepository } from '../../infrastructure/repository/services_recherche/recettes/recettes.repository';
import { FinderInterface } from './finderInterface';
import { ServiceRechercheID } from './serviceRechercheID';

@Injectable()
export class RechercheServiceManager {
  constructor(
    private presDeChezNousRepository: PresDeChezNousRepository,
    private fruitsLegumesRepository: FruitsLegumesRepository,
    private recettesRepository: RecettesRepository,
  ) {}

  public getFinderById(serviceId: ServiceRechercheID): FinderInterface {
    switch (serviceId) {
      case ServiceRechercheID.proximite:
        return this.presDeChezNousRepository;
      case ServiceRechercheID.fruits_legumes:
        return this.fruitsLegumesRepository;
      case ServiceRechercheID.recettes:
        return this.recettesRepository;
      default:
        return null;
    }
  }
}
