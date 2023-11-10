import { Injectable } from '@nestjs/common';
import { Service } from 'src/domain/service/service';
import {
  RefreshableService,
  ServiceDefinition,
} from '../domain/service/serviceDefinition';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { EcoWattServiceManager } from '../infrastructure/service/ecowatt/ecoWattServiceManager';
import { GenericServiceManager } from 'src/infrastructure/service/GenericServiceManager';

const fake_manager = {
  computeDynamicData: async () => {
    return { label: `En construction 🚧` };
  },
};

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
    this.refreshableServiceManagerMap = {
      ecowatt: this.ecoWattServiceManager,
      linky: fake_manager,
      recettes: fake_manager,
      dummy: fake_manager,
    };
  }

  async refreshServiceDynamicData(): Promise<string[]> {
    let serviceListToRefresh =
      await this.serviceRepository.listeServiceDefinitionsByIdArray(
        Object.values(RefreshableService),
      );

    serviceListToRefresh = serviceListToRefresh.filter((serviceDefinition) =>
      serviceDefinition.isReadyForRefresh(),
    );

    let resultStatusList = [];
    for (let index = 0; index < serviceListToRefresh.length; index++) {
      const serviceDefinition = serviceListToRefresh[index];
      const refreshStatus = await this.refreshService(serviceDefinition);
      resultStatusList.push(refreshStatus);
    }
    return resultStatusList;
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

    const result = await manager.computeDynamicData();
    if (result === null) {
      return `FAILED REFRESH : ${serviceDefinition.serviceDefinitionId}`;
    }
    serviceDefinition.dynamic_data = result;
    serviceDefinition.setNextRefreshDate();
    serviceDefinition.last_refresh = new Date();
    await this.serviceRepository.updateServiceDefinition(serviceDefinition);
    return `REFRESHED OK : ${serviceDefinition.serviceDefinitionId}`;
  }
}
