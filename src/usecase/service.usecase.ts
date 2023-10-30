import { Injectable } from '@nestjs/common';
import { Service } from 'src/domain/service';
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
  async listeServicesOfUtilisateur(utilisateurId: string): Promise<Service[]> {
    let result = await this.serviceRepository.listeServicesOfUtilisateur(
      utilisateurId,
    );
    // FIXME : temp value for label, dynamic data in the end
    result.forEach((service) => {
      service.label = service.titre;
    });
    return result;
  }
}
