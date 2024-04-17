import { Service } from '../../../src/domain/service/service';

export interface AsyncServiceManager {
  runAsyncProcessing(service: Service): Promise<string>;

  isActivated(service: Service): Promise<boolean>;
  isConfigured(service: Service): Promise<boolean>;
  isFullyRunning(service: Service): Promise<boolean>;
  checkConfiguration(configuration: Object);
  processAndUpdateConfiguration(service: Service): Promise<void>;
}
