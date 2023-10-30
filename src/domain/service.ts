import {
  ServiceDefinition,
  ServiceDefinitionData,
} from './serviceDefinition';

export class ServiceData {
  id: string;
  serviceDefinition: ServiceDefinitionData;
}
export class Service extends ServiceData {
  constructor(data: ServiceData) {
    super();
    this.id = data.id;
    this.serviceDefinition = new ServiceDefinition(data.serviceDefinition);
  }
}
