import { Injectable } from '@nestjs/common';

import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { PartenaireRepository } from '../infrastructure/repository/partenaire.repository';

interface ContentAssociatedWithPartenaires extends AssociatedWithPartenaires {
  content_id: string;
}

@Injectable()
export class PartenaireUsecase {
  constructor(
    private communeRepository: CommuneRepository,
    private partenaireRepository: PartenaireRepository,
  ) {}

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

  public async updateFromPartenaireCodes<
    T extends ContentAssociatedWithPartenaires,
  >(repository: Paginated<T> & WithPartenaireCodes<T>, partenaire_id: string) {
    const liste = await repository.findByPartenaireId(partenaire_id);

    for (const elem of liste) {
      await this.updateCodesForEachPartenairesIn(repository, elem);
    }
  }

  public async updateAllFromPartenaireCodes<
    T extends ContentAssociatedWithPartenaires,
  >(
    repository: Paginated<T> & WithPartenaireCodes<T> & WithCache,
    block_size = 100,
  ): Promise<void> {
    await this.partenaireRepository.loadCache();

    const total_count = await repository.countAll();
    for (let index = 0; index < total_count; index = index + block_size) {
      const current_list = await repository.listePaginated(index, block_size);

      for (const elem of current_list) {
        await this.updateCodesForEachPartenairesIn(repository, elem);
      }
    }

    await repository.loadCache();
  }

  private async updateCodesForEachPartenairesIn<
    T extends ContentAssociatedWithPartenaires,
  >(repository: Paginated<T> & WithPartenaireCodes<T>, elem: T) {
    await this.partenaireRepository.loadCache();

    const computed =
      this.external_compute_communes_departement_regions_from_liste_partenaires(
        elem.getPartenaireIds(),
      );

    await repository.updateCodesFromPartenaireFor(
      elem.content_id,
      computed.codes_commune,
      computed.codes_departement,
      computed.codes_region,
    );
  }
}
