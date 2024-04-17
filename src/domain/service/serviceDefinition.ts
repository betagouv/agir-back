import { Thematique } from '../contenu/thematique';
import { App } from '../app';

export enum ScheduledService {
  ecowatt = 'ecowatt',
  dummy_scheduled = 'dummy_scheduled',
}
export enum LiveService {
  fruits = 'fruits',
  linky = 'linky',
  dummy_live = 'dummy_live',
}
export enum AsyncService {
  linky = 'linky',
  dummy_async = 'dummy_async',
}

export interface ServiceDynamicData {
  label: string;
  isInError: boolean;
}

export class ServiceDefinitionData {
  serviceDefinitionId: string;
  titre: string;
  is_local: boolean;
  url: string;
  icon_url: string;
  image_url: string;
  is_url_externe: boolean;
  thematiques: Thematique[] = [];
  nombre_installation: number = 0;
  is_installed: boolean;
  minute_period: number;
  scheduled_refresh: Date;
  last_refresh: Date;
  dynamic_data: ServiceDynamicData;
  description: string;
  sous_description: string;
  parametrage_requis: boolean;
}

export class ServiceDefinition extends ServiceDefinitionData {
  constructor(data: ServiceDefinitionData) {
    super();
    Object.assign(this, data);
  }

  public isScheduledServiceType?(): boolean {
    return ScheduledService[this.serviceDefinitionId] != undefined;
  }
  public isLiveServiceType?(): boolean {
    return LiveService[this.serviceDefinitionId] != undefined;
  }
  public isAsyncServiceType?(): boolean {
    return AsyncService[this.serviceDefinitionId] != undefined;
  }
  public setNextRefreshDate?() {
    if (this.minute_period) {
      this.scheduled_refresh = new Date(
        Date.now() + 1000 * 60 * this.minute_period,
      );
    }
  }
  public isEnConstruction?(): boolean {
    return !App.getServiceActifsStringList().includes(
      this.serviceDefinitionId,
    );
  }

  public isReadyForRefresh?(): boolean {
    return (
      this.minute_period != null &&
      (this.scheduled_refresh == null ||
        this.scheduled_refresh.getTime() < Date.now())
    );
  }
}
