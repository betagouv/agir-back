import { Service } from 'src/domain/service/service';
import { ServiceDynamicData } from '../../domain/service/serviceDefinition';

export interface LiveServiceManager {
  computeLiveDynamicData(service?: Service): Promise<ServiceDynamicData>;
}
