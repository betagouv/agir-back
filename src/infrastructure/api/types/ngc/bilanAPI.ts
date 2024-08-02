import { ApiProperty } from '@nestjs/swagger';
import { BilanCarbone } from '../../../../domain/bilan/bilanCarbone';
import { Univers } from '../../../../domain/univers/univers';
import { ThematiqueRepository } from '../../../repository/thematique.repository';

export class PourcentageImpactAPI {
  @ApiProperty() univers: Univers;
  @ApiProperty() univers_label: string;
  @ApiProperty() pourcentage: number;
  @ApiProperty() impact_kg_annee: number;
}
export class BilanCarboneAPI {
  @ApiProperty({ type: [PourcentageImpactAPI] }) detail: PourcentageImpactAPI[];
  @ApiProperty() impact_kg_annee: number;

  public static mapToAPI(bilan: BilanCarbone): BilanCarboneAPI {
    return {
      impact_kg_annee: bilan.impact_kg_annee,
      detail: bilan.detail.map((e) => ({
        pourcentage: e.pourcentage,
        univers: e.univers,
        univers_label: ThematiqueRepository.getTitreUnivers(e.univers),
        impact_kg_annee: e.impact_kg_annee,
      })),
    };
  }
}
