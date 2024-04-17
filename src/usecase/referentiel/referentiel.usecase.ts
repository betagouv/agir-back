import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '../../../src/infrastructure/repository/service.repository';

const service_catalogue = require('./service_catalogue');

@Injectable()
export class ReferentielUsecase {
  constructor(private serviceRepository: ServiceRepository) {}

  async upsertServicesDefinitions() {
    const keyList = Object.keys(service_catalogue);
    for (let index = 0; index < keyList.length; index++) {
      const serviceId = keyList[index];
      const service = service_catalogue[serviceId];
      service['serviceDefinitionId'] = serviceId;
      await this.serviceRepository.upsert(service);
    }
  }
}
