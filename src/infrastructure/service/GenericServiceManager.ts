import { ServiceDynamicData } from '../../../src/domain/service/serviceDefinition';

export interface GenericServiceManager {
  computeDynamicData(): Promise<ServiceDynamicData>;
}
