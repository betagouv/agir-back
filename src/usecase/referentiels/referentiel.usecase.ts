import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '../../infrastructure/repository/service.repository';
import { NewServiceDefinition } from '../../domain/bibliotheque_services/newServiceDefinition';

const old_service_catalogue = require('./old_service_catalogue');
const new_service_catalogue = require('./new_service_catalogue');

@Injectable()
export class ReferentielUsecase {
  constructor(private serviceRepository: ServiceRepository) {}

  async upsertServicesDefinitions() {
    const keyList = Object.keys(old_service_catalogue);
    for (let index = 0; index < keyList.length; index++) {
      const serviceId = keyList[index];
      const service = old_service_catalogue[serviceId];
      const data = { ...service };
      data['serviceDefinitionId'] = serviceId;
      await this.serviceRepository.upsert(data);
    }
  }

  public static getNewServiceCatalogue(): NewServiceDefinition[] {
    return new_service_catalogue.map((c) => new NewServiceDefinition(c));
  }
}