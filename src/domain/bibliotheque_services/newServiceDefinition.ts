import { ServiceExterneID } from './serviceExterneID';
import { ServiceRechercheID } from './recherche/serviceRechercheID';
import { ServiceAsyncID } from './serviceAsyncID';

export class NewServiceDefinition {
  id: ServiceRechercheID | ServiceExterneID | ServiceAsyncID;
  titre: string;
  sous_titre: string;
  icon_url: string;
  univers: string;
  external_url?: string;
  is_available_inhouse: boolean;

  constructor(serviceDef?: NewServiceDefinition) {
    Object.assign(this, serviceDef);
  }
}
