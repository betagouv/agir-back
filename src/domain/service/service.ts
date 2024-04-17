import { ServiceDefinition } from './serviceDefinition';

export enum ServiceErrorKey {
  error_code = 'error_code',
  error_message = 'error_message',
}
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
  is_configured?: boolean;
  is_activated?: boolean;
  is_fully_running?: boolean;

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

  public addErrorCodeToConfiguration?(code: string) {
    this.configuration[ServiceErrorKey.error_code] = code;
  }
  public addErrorMessageToConfiguration?(message: string) {
    this.configuration[ServiceErrorKey.error_message] = message;
  }

  public resetErrorState?() {
    delete this.configuration[ServiceErrorKey.error_code];
    delete this.configuration[ServiceErrorKey.error_message];
  }
  public static resetErrorState?(configuration: Object) {
    delete configuration[ServiceErrorKey.error_code];
    delete configuration[ServiceErrorKey.error_message];
  }

  public isInError?(): boolean {
    return this.configuration[ServiceErrorKey.error_code] !== undefined;
  }

  public getErrorCode?(): string {
    return this.configuration[ServiceErrorKey.error_code];
  }
  public getErrorMessage?(): string {
    return this.configuration[ServiceErrorKey.error_message];
  }
}
