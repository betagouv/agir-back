import { Thematique } from '../thematique';

export class ServiceDefinitionData {
  id: string;
  titre: string;
  local: boolean;
  url: string;
  is_url_externe: boolean;
  thematiques: Thematique[] = [];
  nombre_installation: number = 0;
}
export class ServiceDefinition extends ServiceDefinitionData {
  constructor(data: ServiceDefinitionData) {
    super();
    Object.assign(this, data);
  }
}
