import { Thematique } from '../thematique';

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
}
export class ServiceDefinition extends ServiceDefinitionData {
  constructor(data: ServiceDefinitionData) {
    super();
    Object.assign(this, data);
  }
}
