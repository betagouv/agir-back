import { Injectable } from '@nestjs/common';
import { Service, ServiceStatus } from '../../src/domain/service/service';
import {
  AsyncService,
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
import { LinkyServiceManager } from '../../src/infrastructure/service/linky/LinkyServiceManager';
import { LinkyConfigurationAPI } from '../../src/infrastructure/api/types/service/linkyConfigurationAPI';
import { AsyncServiceManager } from '../../src/infrastructure/service/AsyncServiceManager';

const dummy_live_manager = {
  computeLiveDynamicData: async (service: Service) => {
    return { label: `En construction 🚧`, isInError: false };
  },
};
const dummy_async_manager = {
  runAsyncProcessing: async (service: Service) => {
    return service.serviceId;
  },
  checkConfiguration(conf: Object) {},
  async isActivated(service: Service) {
    return true;
  },
  async isConfigured(service: Service) {
    return true;
  },
  async isFullyRunning(service: Service) {
    return true;
  },
  async processConfiguration(conf: Object) {},
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
  private readonly ASYNC_SERVICES: Record<AsyncService, AsyncServiceManager>;

  constructor(
    private serviceRepository: ServiceRepository,
    private readonly ecoWattServiceManager: EcoWattServiceManager,
    private readonly fruitsEtLegumesServiceManager: FruitsEtLegumesServiceManager,
    private readonly linkyServiceManager: LinkyServiceManager,
    private readonly eventUsecase: EventUsecase,
  ) {
    this.SCHEDULED_SERVICES = {
      ecowatt: this.ecoWattServiceManager,
      dummy_scheduled: dummy_scheduled_manager,
    };
    this.LIVE_SERVICES = {
      fruits: this.fruitsEtLegumesServiceManager,
      linky: this.linkyServiceManager,
      dummy_live: dummy_live_manager,
    };
    this.ASYNC_SERVICES = {
      linky: this.linkyServiceManager,
      dummy_async: dummy_async_manager,
    };
  }

  async updateServiceConfiguration(
    utilisateurId: string,
    serviceDefinitionId: string,
    payload: LinkyConfigurationAPI,
  ) {
    const service = await this.serviceRepository.getServiceOfUtilisateur(
      utilisateurId,
      serviceDefinitionId,
    );

    const manager = this.getAsyncServiceManager(serviceDefinitionId);

    manager.checkConfiguration(payload);

    service.configuration = { ...service.configuration, ...payload };

    manager.processConfiguration(service);

    await this.serviceRepository.updateServiceConfiguration(
      utilisateurId,
      serviceDefinitionId,
      service.configuration,
    );
  }

  async refreshScheduledServices(): Promise<string[]> {
    let serviceDefinitionList =
      await this.serviceRepository.listeServiceDefinitionsToRefresh();

    const serviceToRefreshList = serviceDefinitionList.filter(
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

  async processAsyncServices(): Promise<string[]> {
    let resultStatusList = [];
    let serviceDefinitionList =
      await this.serviceRepository.listeServiceDefinitions();

    const serviceDefsToProcess = serviceDefinitionList.filter(
      (serviceDefinition) => serviceDefinition.isAsyncServiceType(),
    );

    for (let index = 0; index < serviceDefsToProcess.length; index++) {
      const serviceDefinition = serviceDefsToProcess[index];
      const serviceList =
        await this.serviceRepository.listeServicesByDefinitionId(
          serviceDefinition.serviceDefinitionId,
        );
      for (let index2 = 0; index2 < serviceList.length; index2++) {
        const service = serviceList[index2];
        const manager = this.getAsyncServiceManager(
          serviceDefinition.serviceDefinitionId,
        );
        const result = await manager.runAsyncProcessing(service);
        resultStatusList.push(result);
      }
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
    const existing_service =
      await this.serviceRepository.getServiceOfUtilisateur(
        utilisateurId,
        serviceDefinitionId,
      );

    if (existing_service && existing_service.isAsyncServiceType()) {
      this.serviceRepository.updateServiceConfiguration(
        utilisateurId,
        serviceDefinitionId,
        existing_service.configuration,
        ServiceStatus.CREATED,
      );
    } else {
      await this.serviceRepository.addServiceToUtilisateur(
        utilisateurId,
        serviceDefinitionId,
      );
    }
    await this.eventUsecase.processEvent(utilisateurId, {
      type: EventType.service_installed,
      service_id: serviceDefinitionId,
    });
  }

  async removeServiceFromUtilisateur(
    utilisateurId: string,
    serviceDefinitionId: string,
  ) {
    const existing_service =
      await this.serviceRepository.getServiceOfUtilisateur(
        utilisateurId,
        serviceDefinitionId,
      );

    if (
      existing_service.isAsyncServiceType() &&
      existing_service.status === ServiceStatus.LIVE
    ) {
      await this.serviceRepository.updateServiceConfiguration(
        utilisateurId,
        serviceDefinitionId,
        existing_service.configuration,
        ServiceStatus.TO_DELETE,
      );
    } else {
      await this.serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
        utilisateurId,
        serviceDefinitionId,
      );
    }
  }
  async listeServicesOfUtilisateur(utilisateurId: string): Promise<Service[]> {
    const userServiceList =
      await this.serviceRepository.listeServicesOfUtilisateur(utilisateurId);
    for (let index = 0; index < userServiceList.length; index++) {
      const service = userServiceList[index];
      if (service.isLiveServiceType()) {
        await this.refreshLiveService(service);
      }
      await this.setAsyncServiceStateIfNeeded(service);
    }
    return userServiceList;
  }

  async getServiceOfUtilisateur(
    utilisateurId: string,
    serviceDefinitionId: string,
  ): Promise<Service> {
    const service = await this.serviceRepository.getServiceOfUtilisateur(
      utilisateurId,
      serviceDefinitionId,
    );
    if (service === null) return null;

    if (service.isLiveServiceType()) {
      await this.refreshLiveService(service);
    }
    await this.setAsyncServiceStateIfNeeded(service);

    return service;
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
  private getAsyncServiceManager(
    serviceDefinitionId: string,
  ): AsyncServiceManager {
    return this.ASYNC_SERVICES[serviceDefinitionId];
  }

  private async setAsyncServiceStateIfNeeded(service: Service) {
    if (service.isAsyncServiceType()) {
      const manager = this.getAsyncServiceManager(service.serviceDefinitionId);
      service.is_configured = await manager.isConfigured(service);
      service.is_activated = await manager.isActivated(service);
      service.is_fully_running = await manager.isFullyRunning(service);
    }
  }
}
