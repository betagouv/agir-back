import { Echelle } from '../aides/echelle';

export class PartenaireDefinition {
  id_cms: string;
  nom: string;
  url: string;
  code_commune: string;
  code_departement: string;
  code_region: string;
  code_epci: string;
  image_url: string;
  echelle: Echelle;
  liste_codes_commune_from_EPCI: string[];
}
