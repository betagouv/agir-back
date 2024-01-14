import { Injectable } from '@nestjs/common';
import { PonderationRepository } from '../../../src/infrastructure/repository/ponderation.repository';
import { ServiceRepository } from '../../../src/infrastructure/repository/service.repository';

const service_catalogue = require('./service_catalogue');
const ponderation_catalogue = require('./ponderation_catalogue');

@Injectable()
export class ReferentielUsecase {
  constructor(
    private serviceRepository: ServiceRepository,
    private ponderationRepository: PonderationRepository,
  ) {}

  async upsertServicesDefinitions() {
    const keyList = Object.keys(service_catalogue);
    for (let index = 0; index < keyList.length; index++) {
      const serviceId = keyList[index];
      const service = service_catalogue[serviceId];
      service['serviceDefinitionId'] = serviceId;
      await this.serviceRepository.upsert(service);
    }
  }
  async upsertPonderations() {
    const keyList = Object.keys(ponderation_catalogue);
    for (let index = 0; index < keyList.length; index++) {
      const ponderationId = keyList[index];
      const ponderation = ponderation_catalogue[ponderationId];
      ponderation['id'] = ponderationId;
      await this.ponderationRepository.upsert(ponderation);
    }
  }
}
