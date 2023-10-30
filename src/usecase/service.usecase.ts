import { Injectable } from '@nestjs/common';
import { ServiceDefinition } from '../../src/domain/serviceDefinition';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';

@Injectable()
export class ServiceUsecase {
  constructor(private serviceRepository: ServiceRepository) {}

  async listServicesDefinitions(): Promise<ServiceDefinition[]> {
    return this.serviceRepository.listeServiceDefinitions();
  }
  async addServiceToUtilisateur(
    utilisateurId: string,
    serviceDefinitionId: string,
  ) {
    return this.serviceRepository.addServiceToUtilisateur(
      utilisateurId,
      serviceDefinitionId,
    );
  }
  async removeServiceFromUtilisateur(serviceId: string) {
    return this.serviceRepository.removeServiceFromUtilisateur(serviceId);
  }
}
