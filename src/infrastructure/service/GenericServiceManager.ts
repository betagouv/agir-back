import { Service } from 'src/domain/service/service';
import {
  ServiceDefinition,
  ServiceDynamicData,
} from '../../../src/domain/service/serviceDefinition';

export interface GenericServiceManager {
  computeScheduledDynamicData(
    serviceDefinition?: ServiceDefinition,
  ): Promise<ServiceDynamicData>;
  computeLiveDynamicData(service?: Service): Promise<ServiceDynamicData>;
}
