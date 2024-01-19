import { Service } from 'src/domain/service/service';

export interface AsyncServiceManager {
  runAsyncProcessing(service: Service): Promise<string>;

  checkConfiguration(configuration: Object);
}
