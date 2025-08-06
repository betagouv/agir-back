import { PartenaireDefinition } from '../partenaires/partenaireDefinition';
import { AideDefinition } from './aideDefinition';

export type EPCI_AIDE_EXPORT = {
  code_siren_epci: string;
  nom_epci: string;
  nature_epci: string;
  codes_commune_manquants: string[];
  codes_commune_qui_matchent: string[];
};
export type CodeNom = {
  code: string;
  nom: string;
};

export class AideExport extends AideDefinition {
  constructor(data: AideDefinition) {
    super(data);
  }

  liste_codes_communes: string[];
  liste_EPCI: EPCI_AIDE_EXPORT[];
  liste_codes_communes_hors_EPCI: CodeNom[];
  liste_partenaires: (PartenaireDefinition & { type_epci: string })[];
  est_grand_est: boolean;
}
