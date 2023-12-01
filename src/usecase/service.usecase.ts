import { Injectable } from '@nestjs/common';
import { Service } from '../../src/domain/service/service';
import {
  LiveService,
  ScheduledService,
  ServiceDefinition,
} from '../domain/service/serviceDefinition';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { EcoWattServiceManager } from '../infrastructure/service/ecowatt/ecoWattServiceManager';
import { FruitsEtLegumesServiceManager } from '../infrastructure/service/fruits/fruitEtLegumesServiceManager';
import { ScheduledServiceManager } from '../../src/infrastructure/service/ScheduledServiceManager';
import { LiveServiceManager } from '../../src/infrastructure/service/LiveServiceManager';
import { EventUsecase } from '../../src/usecase/event.usecase';
import { EventType } from '../../src/domain/utilisateur/utilisateurEvent';

const dummy_live_manager = {
  computeLiveDynamicData: async (service: Service) => {
    return { label: `En construction 🚧`, isInError: false };
  },
};
const dummy_scheduled_manager = {
  computeScheduledDynamicData: async (serviceDefinition: ServiceDefinition) => {
    return { label: `En construction 🚧`, isInError: false };
  },
};

@Injectable()
export class ServiceUsecase {
  private readonly SCHEDULED_SERVICES: Record<
    ScheduledService,
    ScheduledServiceManager
  >;
  private readonly LIVE_SERVICES: Record<LiveService, LiveServiceManager>;

  constructor(
    private serviceRepository: ServiceRepository,
    private readonly ecoWattServiceManager: EcoWattServiceManager,
    private readonly fruitsEtLegumesServiceManager: FruitsEtLegumesServiceManager,
    private readonly eventUsecase: EventUsecase,
  ) {
    this.SCHEDULED_SERVICES = {
      ecowatt: this.ecoWattServiceManager,
      dummy_scheduled: dummy_scheduled_manager,
    };
    this.LIVE_SERVICES = {
      fruits: this.fruitsEtLegumesServiceManager,
      dummy_live: dummy_live_manager,
    };
  }

  async refreshScheduledServices(): Promise<string[]> {
    let serviceList =
      await this.serviceRepository.listeServiceDefinitionsToRefresh();

    const serviceToRefreshList = serviceList.filter(
      (serviceDefinition) =>
        serviceDefinition.isScheduledServiceType() &&
        serviceDefinition.isReadyForRefresh(),
    );

    let resultStatusList = [];
    for (let index = 0; index < serviceToRefreshList.length; index++) {
      const serviceDefinition = serviceToRefreshList[index];
      const refreshStatus = await this.refreshScheduledService(
        serviceDefinition,
      );
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
    await this.serviceRepository.addServiceToUtilisateur(
      utilisateurId,
      serviceDefinitionId,
    );
    await this.eventUsecase.processEvent(utilisateurId, {
      type: EventType.service_installed,
      service_id: ScheduledService.ecowatt,
    });
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
    const userServiceList =
      await this.serviceRepository.listeServicesOfUtilisateur(utilisateurId);
    for (let index = 0; index < userServiceList.length; index++) {
      const service = userServiceList[index];
      if (service.isLiveServiceType()) {
        await this.refreshLiveService(service);
      }
    }
    return userServiceList;
  }

  private async refreshLiveService(service: Service) {
    const manager = this.getLiveServiceManager(service);
    const result = await manager.computeLiveDynamicData(service);
    service.dynamic_data = result;
  }

  private async refreshScheduledService(serviceDefinition: ServiceDefinition) {
    const manager = this.getScheduledServiceManager(serviceDefinition);

    const result = await manager.computeScheduledDynamicData(serviceDefinition);
    if (result.isInError) {
      return `FAILED REFRESH : ${serviceDefinition.serviceDefinitionId}`;
    }
    serviceDefinition.dynamic_data = result;
    serviceDefinition.setNextRefreshDate();
    serviceDefinition.last_refresh = new Date();
    await this.serviceRepository.updateServiceDefinition(serviceDefinition);
    return `REFRESHED OK : ${serviceDefinition.serviceDefinitionId}`;
  }

  private getLiveServiceManager(
    serviceDefinition: ServiceDefinition,
  ): LiveServiceManager {
    return this.LIVE_SERVICES[serviceDefinition.serviceDefinitionId];
  }
  private getScheduledServiceManager(
    serviceDefinition: ServiceDefinition,
  ): ScheduledServiceManager {
    return this.SCHEDULED_SERVICES[serviceDefinition.serviceDefinitionId];
  }
}
