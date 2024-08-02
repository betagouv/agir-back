import { ServiceExterneID } from './serviceExterneID';
import { ServiceRechercheID } from './serviceRechercheID';

export class ServiceRechercheDefinition {
  id: ServiceRechercheID | ServiceExterneID;
  titre: string;
  sous_titre: string;
  icon_url: string;
  univers: string;
  external_url?: string;
  is_available_inhouse: boolean;

  constructor(serviceDef?: ServiceRechercheDefinition) {
    Object.assign(this, serviceDef);
  }
}
