import { Injectable } from '@nestjs/common';
import { Service } from '../../../../src/domain/service/service';
import {
  ServiceDefinition,
  ServiceDynamicData,
} from '../../../../src/domain/service/serviceDefinition';
import { GenericServiceManager } from '../GenericServiceManager';

@Injectable()
export class FruitsEtLegumesServiceManager implements GenericServiceManager {
  async computeScheduledDynamicData(
    serviceDefinition: ServiceDefinition,
  ): Promise<ServiceDynamicData> {
    return {
      label: '🥦 Broccoli',
      isInError: false,
    };
  }
  async computeLiveDynamicData(service: Service): Promise<ServiceDynamicData> {
    return {
      label: '🥦 Broccoli',
      isInError: false,
    };
  }
}
