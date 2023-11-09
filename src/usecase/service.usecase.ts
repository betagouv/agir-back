import { Injectable } from '@nestjs/common';
import { Service } from 'src/domain/service/service';
import { ServiceDefinition } from '../domain/service/serviceDefinition';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';

@Injectable()
export class ServiceUsecase {
  constructor(private serviceRepository: ServiceRepository) {}

  async listServicesDefinitions(
    utilisateurId: string,
  ): Promise<ServiceDefinition[]> {
    return this.serviceRepository.listeServiceDefinitionsAndUserRelatedServices(
      utilisateurId,
    );
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
  async removeServiceFromUtilisateur(
    utilisateurId: string,
    serviceDefinitionId: string,
  ) {
    return this.serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
      utilisateurId,
      serviceDefinitionId,
    );
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
