import { Injectable } from '@nestjs/common';

import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { PartenaireRepository } from '../infrastructure/repository/partenaire.repository';

@Injectable()
export class PartenaireUsecase {
  constructor(private communeRepository: CommuneRepository) {}

  public external_compute_codes_communes_from_liste_partenaires(
    part_ids: string[],
  ): string[] {
    if (!part_ids || part_ids.length === 0) {
      return [];
    }
    const result = new Set<string>();

    for (const partenare_id of part_ids) {
      const partenaire = PartenaireRepository.getPartenaire(partenare_id);
      if (partenaire.code_commune) {
        result.add(partenaire.code_commune);
      }
      if (partenaire.code_epci) {
        const liste_codes_communes = this.external_compute_communes_from_epci(
          partenaire.code_epci,
        );
        for (const commune of liste_codes_communes) {
          result.add(commune);
        }
      }
    }
    return Array.from(result);
  }

  public external_compute_communes_departement_regions_from_liste_partenaires(
    part_ids: string[],
  ): {
    codes_commune: string[];
    codes_region: string[];
    codes_departement: string[];
  } {
    const result = {
      codes_commune: [],
      codes_departement: [],
      codes_region: [],
    };
    if (!part_ids || part_ids.length === 0) {
      return result;
    }
    const all_codes_communes = new Set<string>();
    const codes_departement = new Set<string>();
    const codes_region = new Set<string>();

    for (const partenare_id of part_ids) {
      const partenaire = PartenaireRepository.getPartenaire(partenare_id);
      if (partenaire) {
        if (partenaire.code_commune) {
          all_codes_communes.add(partenaire.code_commune);
        }
        if (partenaire.code_epci) {
          const liste_codes_communes = this.external_compute_communes_from_epci(
            partenaire.code_epci,
          );
          for (const commune of liste_codes_communes) {
            all_codes_communes.add(commune);
          }
        }
        if (partenaire.code_departement) {
          codes_departement.add(partenaire.code_departement);
        }
        if (partenaire.code_region) {
          codes_region.add(partenaire.code_region);
        }
      }
    }

    result.codes_commune = Array.from(all_codes_communes);
    result.codes_departement = Array.from(codes_departement);
    result.codes_region = Array.from(codes_region);

    return result;
  }

  public external_compute_communes_from_epci(code_EPCI: string): string[] {
    if (!code_EPCI) {
      return [];
    }
    return this.communeRepository.getListeCodesCommuneParCodeEPCI(code_EPCI);
  }
}
