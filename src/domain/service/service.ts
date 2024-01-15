import { ServiceDefinition } from './serviceDefinition';

export class ServiceData extends ServiceDefinition {
  serviceId: string;
  configuration: Object;
  constructor() {
    super({} as any);
  }
}
export class Service extends ServiceData {
  constructor(data: ServiceData) {
    super();
    Object.assign(this, data);
  }
}
