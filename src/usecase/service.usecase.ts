import { Injectable } from '@nestjs/common';
import { Service, ServiceStatus } from '../../src/domain/service/service';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AsyncServiceManager } from '../../src/infrastructure/service/AsyncServiceManager';
import { LiveServiceManager } from '../../src/infrastructure/service/LiveServiceManager';
import { ScheduledServiceManager } from '../../src/infrastructure/service/ScheduledServiceManager';
import { EventUsecase } from '../../src/usecase/event.usecase';
import { EventType } from '../domain/appEvent';
import {
  AsyncService,
  LiveService,
  ScheduledService,
  ServiceDefinition,
} from '../domain/service/serviceDefinition';
import { FruitsEtLegumesServiceManager } from '../infrastructure/service/fruits/fruitEtLegumesServiceManager';

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
  async processAndUpdateConfiguration(service: Service) {},
  async emptyConfiguration(service: Service) {},
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
    private utilisateurRepository: UtilisateurRepository,
    private serviceRepository: ServiceRepository,
    private readonly fruitsEtLegumesServiceManager: FruitsEtLegumesServiceManager,
    private readonly eventUsecase: EventUsecase,
  ) {
    this.SCHEDULED_SERVICES = {
      dummy_scheduled: dummy_scheduled_manager,
    };
    this.LIVE_SERVICES = {
      fruits: this.fruitsEtLegumesServiceManager,
      dummy_live: dummy_live_manager,
    };
    this.ASYNC_SERVICES = {
      dummy_async: dummy_async_manager,
    };
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

  private async addServiceToUtilisateur(
    utilisateurId: string,
    serviceDefinitionId: string,
  ) {
    await this.utilisateurRepository.checkState(utilisateurId);

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
    await this.utilisateurRepository.checkState(utilisateurId);

    const existing_service =
      await this.serviceRepository.getServiceOfUtilisateur(
        utilisateurId,
        serviceDefinitionId,
      );
    if (existing_service === null) {
      ApplicationError.throwServiceNotFound(serviceDefinitionId);
    }

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

  async getServiceOfUtilisateur(
    utilisateurId: string,
    serviceDefinitionId: string,
  ): Promise<Service> {
    await this.utilisateurRepository.checkState(utilisateurId);

    let service = await this.serviceRepository.getServiceOfUtilisateur(
      utilisateurId,
      serviceDefinitionId,
    );

    if (service.isLiveServiceType()) {
      await this.refreshLiveService(service);
    }
    await this.setAsyncServiceStateIfNeeded(service);

    if (service.status === ServiceStatus.TO_DELETE) {
      const manager = this.getAsyncServiceManager(serviceDefinitionId);
      manager.emptyConfiguration(service);
    }

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
