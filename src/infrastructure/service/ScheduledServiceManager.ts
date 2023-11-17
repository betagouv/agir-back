import {
  ServiceDefinition,
  ServiceDynamicData,
} from '../../domain/service/serviceDefinition';

export interface ScheduledServiceManager {
  computeScheduledDynamicData(
    serviceDefinition?: ServiceDefinition,
  ): Promise<ServiceDynamicData>;
}
