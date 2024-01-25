import { ServiceDefinition } from './serviceDefinition';

const ERROR_CODE_KEY = 'error_code';
const ERROR_MESSAGE_KEY = 'error_message';

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
    this.configuration[ERROR_CODE_KEY] = code;
  }
  public addErrorMessageToConfiguration?(message: string) {
    this.configuration[ERROR_MESSAGE_KEY] = message;
  }

  public resetErrorState?() {
    delete this.configuration[ERROR_CODE_KEY];
    delete this.configuration[ERROR_MESSAGE_KEY];
  }

  public isInError?(): boolean {
    return this.configuration[ERROR_CODE_KEY] !== undefined;
  }

  public getErrorCode?(): string {
    return this.configuration[ERROR_CODE_KEY];
  }
  public getErrorMessage?(): string {
    return this.configuration[ERROR_MESSAGE_KEY];
  }
}
