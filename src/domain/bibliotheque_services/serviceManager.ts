import { Injectable } from '@nestjs/common';
import { PresDeChezNousRepository } from '../../infrastructure/repository/services_recherche/presDeChezNous.repository';
import { FinderInterface } from './finderInterface';
import { ServiceRechercheID } from './serviceRechercheID';

@Injectable()
export class RechercheServiceManager {
  constructor(private presDeChezNousRepository: PresDeChezNousRepository) {}

  public getFinderById(serviceId: ServiceRechercheID): FinderInterface {
    switch (serviceId) {
      case ServiceRechercheID.proximite:
        return this.presDeChezNousRepository;
      default:
        return null;
    }
  }
}
