import { Thematique } from '../thematique';

export enum RefreshableService {
  ecowatt = 'ecowatt',
  fruits = 'fruits',
  linky = 'linky',
  recettes = 'recettes',
  dummy_live = 'dummy_live',
  dummy_schduled = 'dummy_scheduled',
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
}

export class ServiceDefinition extends ServiceDefinitionData {
  constructor(data: ServiceDefinitionData) {
    super();
    Object.assign(this, data);
  }

  public setNextRefreshDate() {
    if (this.minute_period) {
      this.scheduled_refresh = new Date(
        Date.now() + 1000 * 60 * this.minute_period,
      );
    }
  }

  public isReadyForRefresh(): boolean {
    return (
      this.minute_period != null &&
      (this.scheduled_refresh == null ||
        this.scheduled_refresh.getTime() < Date.now())
    );
  }
}
