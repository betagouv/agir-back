import { Service } from 'src/domain/service/service';

export interface AsyncServiceManager {
  runAsyncProcessing(service: Service): Promise<string>;

  isActivated(service: Service);
  isConfigured(service: Service);
  isFullyRunning(service: Service);
  checkConfiguration(configuration: Object);
  processConfiguration(configuration: Object);
}
