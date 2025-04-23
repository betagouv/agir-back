import { Injectable } from '@nestjs/common';
import { FruitsLegumesRepository } from '../../../infrastructure/repository/services_recherche/fruitsLegumes.repository';
import { ImpactTransportsRepository } from '../../../infrastructure/repository/services_recherche/impactTransport.repository';
import { LongueVieObjetsRepository } from '../../../infrastructure/repository/services_recherche/lvo/LongueVieObjets.repository';
import { MaifRepository } from '../../../infrastructure/repository/services_recherche/maif/maif.repository';
import { PresDeChezNousRepository } from '../../../infrastructure/repository/services_recherche/pres_de_chez_nous/presDeChezNous.repository';
import { RecettesRepository } from '../../../infrastructure/repository/services_recherche/recettes/recettes.repository';
import { FinderInterface } from './finderInterface';
import { ServiceRechercheID } from './serviceRechercheID';

@Injectable()
export class RechercheServiceManager {
  constructor(
    private presDeChezNousRepository: PresDeChezNousRepository,
    private longueVieObjetsRepository: LongueVieObjetsRepository,
    private fruitsLegumesRepository: FruitsLegumesRepository,
    private recettesRepository: RecettesRepository,
    private impactTransportsRepository: ImpactTransportsRepository,
    private maifRepository: MaifRepository,
  ) {}

  public getFinderById(serviceId: ServiceRechercheID): FinderInterface {
    switch (serviceId) {
      case ServiceRechercheID.proximite:
        return this.presDeChezNousRepository;
      case ServiceRechercheID.fruits_legumes:
        return this.fruitsLegumesRepository;
      case ServiceRechercheID.recettes:
        return this.recettesRepository;
      case ServiceRechercheID.impact_transports:
        return this.impactTransportsRepository;
      case ServiceRechercheID.longue_vie_objets:
        return this.longueVieObjetsRepository;
      case ServiceRechercheID.maif:
        return this.maifRepository;
      default:
        return null;
    }
  }
}
