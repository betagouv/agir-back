import {
  ServiceDefinition,
  ServiceDefinitionConstructorData,
} from './serviceDefinition';

export type ServiceConstructorData = {
  id: string;
  serviceDefinition: ServiceDefinitionConstructorData;
};
export class Service {
  constructor(data: ServiceConstructorData) {
    this.id = data.id;
    this.serviceDefinition = new ServiceDefinition(data.serviceDefinition);
  }
  id: string;
  serviceDefinition: ServiceDefinition;
}
