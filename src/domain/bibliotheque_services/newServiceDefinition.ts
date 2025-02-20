import { ServiceExterneID } from './serviceExterneID';
import { ServiceRechercheID } from './recherche/serviceRechercheID';
import { ServiceAsyncID } from './serviceAsyncID';
import { Thematique } from '../thematique/thematique';

export type NewServiceDefinition = {
  id: ServiceRechercheID | ServiceExterneID | ServiceAsyncID;
  titre: string;
  sous_titre: string;
  icon_url: string;
  thematique: Thematique;
  external_url?: string;
  is_available_inhouse: boolean;
};
