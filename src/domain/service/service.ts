import { ServiceDefinition } from './serviceDefinition';

export enum ServiceStatus {
  CREATED = 'CREATED',
  LIVE = 'LIVE',
  TO_DELETE = 'TO_DELETE',
}
export class ServiceData extends ServiceDefinition {
  serviceId: string;
  utilisateurId: string;
  configuration: Object;
  status?: ServiceStatus;
  constructor() {
    super({} as any);
  }
}
export class Service extends ServiceData {
  constructor(data: ServiceData) {
    super();
    Object.assign(this, data);
    if (!data.status) {
      this.status = ServiceStatus.CREATED;
    }
    if (!data.configuration) {
      this.configuration = {};
    }
  }
}
