import { CommuneRepository } from '../../infrastructure/repository/commune/commune.repository';
import { Thematique } from '../thematique/thematique';
import { Echelle } from './echelle';

export class AideFilter {
  maxNumber?: number;
  thematiques?: Thematique[];
  besoins?: string[];
  code_postal?: string;
  code_region?: string;
  code_departement?: string;
  code_commune?: string;
  echelle?: Echelle;
  date_expiration?: Date;
  commune_pour_partenaire?: string;
  region_pour_partenaire?: string;
  departement_pour_partenaire?: string;
  cu_ca_cc_mode?: boolean;

  constructor(filter?: AideFilter) {
    Object.assign(this, filter);
  }

  public static buildBasicAideFilter(
    code_postal: string,
    code_commune: string,
    liste_thematiques?: Thematique[],
    besoins?: string[],
  ) {
    const dept_region =
      CommuneRepository.findDepartementRegionByCodeCommune(code_commune);

    return new AideFilter({
      code_postal: code_postal,
      code_commune: code_commune,
      date_expiration: new Date(),
      thematiques:
        liste_thematiques && liste_thematiques.length > 0
          ? liste_thematiques
          : undefined,
      cu_ca_cc_mode: true,
      commune_pour_partenaire: code_commune,
      departement_pour_partenaire: dept_region?.code_departement,
      region_pour_partenaire: dept_region?.code_region,
      besoins: besoins,
    });
  }
}
