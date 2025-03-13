import { ApiProperty } from '@nestjs/swagger';
import {
  DetailImpactStandalone,
  ImpactThematiqueStandalone,
} from '../../../../domain/bilan/bilanCarbone';
import { Thematique } from '../../../../domain/thematique/thematique';

export class DetailBilanThematiqueAPI {
  @ApiProperty() label: string;
  @ApiProperty() emoji: string;
  @ApiProperty() impact_kg_annee: number;

  public static mapToAPI(
    detail: DetailImpactStandalone,
  ): DetailBilanThematiqueAPI {
    return {
      label: detail.label,
      impact_kg_annee: detail.impact_kg_annee,
      emoji: detail.emoji,
    };
  }
}

export class BilanThematiqueAPI {
  @ApiProperty() thematique: Thematique;
  @ApiProperty() impact_kg_annee: number;
  @ApiProperty() emoji: string;
  @ApiProperty({ type: [DetailBilanThematiqueAPI] })
  details: DetailBilanThematiqueAPI[];

  public static mapToAPI(
    impact: ImpactThematiqueStandalone,
  ): BilanThematiqueAPI {
    return {
      thematique: impact.thematique,
      impact_kg_annee: impact.impact_kg_annee,
      details: impact.details.map((d) => DetailBilanThematiqueAPI.mapToAPI(d)),
      emoji: impact.emoji,
    };
  }
}
