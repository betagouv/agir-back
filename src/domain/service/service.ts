import { ServiceDefinition } from './serviceDefinition';

export class ServiceData extends ServiceDefinition {
  serviceId: string;
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
