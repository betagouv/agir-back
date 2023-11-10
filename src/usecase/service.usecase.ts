import { Injectable } from '@nestjs/common';
import { Service } from 'src/domain/service/service';
import {
  RefreshableService,
  ServiceDefinition,
} from '../domain/service/serviceDefinition';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { EcoWattServiceManager } from '../infrastructure/service/ecowatt/ecoWattServiceManager';
import { GenericServiceManager } from 'src/infrastructure/service/GenericServiceManager';

@Injectable()
export class ServiceUsecase {
  private readonly refreshableServiceManagerMap: Record<
    RefreshableService,
    GenericServiceManager
  >;

  constructor(
    private serviceRepository: ServiceRepository,
    private readonly ecoWattServiceManager: EcoWattServiceManager,
  ) {
    const fake_manager = {
      computeDynamicData: async () => {
        return { message: `Hello ${Math.random()}` };
      },
    };
    this.refreshableServiceManagerMap = {
      ecowatt: this.ecoWattServiceManager,
      linky: fake_manager,
      recettes: fake_manager,
      dummy: fake_manager,
    };
  }

  async refreshServiceDynamicData(): Promise<number> {
    const serviceListToRefresh =
      await this.serviceRepository.listeServiceDefinitionsToRefresh(
        Object.values(RefreshableService),
      );

    for (let index = 0; index < serviceListToRefresh.length; index++) {
      const serviceDefinition = serviceListToRefresh[index];
      await this.refreshService(serviceDefinition);
    }
    return serviceListToRefresh.length;
  }

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
    return this.serviceRepository.listeServicesOfUtilisateur(utilisateurId);
  }

  private async refreshService(serviceDefinition: ServiceDefinition) {
    const manager: GenericServiceManager =
      this.refreshableServiceManagerMap[serviceDefinition.serviceDefinitionId];

    console.log(
      `START REFRESHING SERVICE : ${serviceDefinition.serviceDefinitionId}`,
    );
    const result = await manager.computeDynamicData();
    if (result === null) {
      console.log(
        `FAILED TO REFRESH SERVICE : ${serviceDefinition.serviceDefinitionId}`,
      );
      return;
    }
    console.log(`REFRESHED SERVICE : ${serviceDefinition.serviceDefinitionId}`);
    serviceDefinition.dynamic_data = result;
    serviceDefinition.setNextRefreshDate();
    await this.serviceRepository.updateServiceDefinition(serviceDefinition);
  }
}
