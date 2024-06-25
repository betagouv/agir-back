import { Injectable } from '@nestjs/common';
import { PresDeChezNous } from '../../../src/infrastructure/repository/services_recherche/presDeChezNous';
import { FinderInterface } from './finderInterface';
import { ServiceRechercheID } from './serviceRechercheID';

@Injectable()
export class RechercheServiceManager {
  constructor(private presDeChezNous: PresDeChezNous) {}

  public getFinderById(serviceId: ServiceRechercheID): FinderInterface {
    switch (serviceId) {
      case ServiceRechercheID.proximite:
        return this.presDeChezNous;
      default:
        return null;
    }
  }
}
