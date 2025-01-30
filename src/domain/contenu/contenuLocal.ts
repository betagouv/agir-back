import { Thematique } from './thematique';

export interface ContenuLocal {
  content_id: string;
  titre: string;
  codes_postaux: string[];
  thematiques: Thematique[];
  include_codes_commune: string[];
  exclude_codes_commune: string[];
  codes_departement: string[];
  codes_region: string[];
}
