import { Thematique } from '../thematique/thematique';
import { ServiceRechercheID } from './recherche/serviceRechercheID';
import { ServiceExterneID } from './serviceExterneID';

export type NewServiceDefinition = {
  id: ServiceRechercheID | ServiceExterneID;
  titre: string;
  sous_titre: string;
  icon_url: string;
  thematique: Thematique;
  external_url?: string;
  is_available_inhouse: boolean;
};
