import { ApiProperty } from '@nestjs/swagger';
import {
  BilanCarbone,
  DetailImpact,
} from '../../../../domain/bilan/bilanCarbone';
import { Univers } from '../../../../domain/univers/univers';
import { ThematiqueRepository } from '../../../repository/thematique.repository';

export class DetailImpactAPI {
  @ApiProperty() label: string;
  @ApiProperty() emoji: string;
  @ApiProperty() pourcentage: number;
  @ApiProperty() pourcentage_categorie: number;
  @ApiProperty() impact_kg_annee: number;

  public static mapToAPI(detail: DetailImpact): DetailImpactAPI {
    return {
      label: detail.label,
      pourcentage: detail.pourcentage,
      pourcentage_categorie: detail.pourcentage_categorie,
      impact_kg_annee: detail.impact_kg_annee,
      emoji: detail.emoji,
    };
  }
}

export class ImpactUniversAPI {
  @ApiProperty() univers: Univers;
  @ApiProperty() univers_label: string;
  @ApiProperty() pourcentage: number;
  @ApiProperty() impact_kg_annee: number;
  @ApiProperty({ type: [DetailImpactAPI] }) details: DetailImpactAPI[];
}
export class BilanCarboneAPI {
  @ApiProperty({ type: [ImpactUniversAPI] })
  impact_univers: ImpactUniversAPI[];
  detail: ImpactUniversAPI[];
  @ApiProperty() impact_kg_annee: number;
  @ApiProperty({ type: [DetailImpactAPI] }) top_3: DetailImpactAPI[];

  public static mapToAPI(bilan: BilanCarbone): BilanCarboneAPI {
    const result: BilanCarboneAPI = {
      impact_kg_annee: bilan.impact_kg_annee,
      top_3: bilan.top_3,
      impact_univers: bilan.impact_univers.map((e) => ({
        pourcentage: e.pourcentage,
        univers: e.univers,
        univers_label: ThematiqueRepository.getTitreUnivers(e.univers),
        impact_kg_annee: e.impact_kg_annee,
        details: e.details.map((d) => DetailImpactAPI.mapToAPI(d)),
      })),
      detail: null,
    };
    result.detail = result.impact_univers;
    return result;
  }
}
