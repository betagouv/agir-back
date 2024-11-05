import { ApiProperty } from '@nestjs/swagger';
import {
  BilanCarbone,
  BilanCarboneSynthese,
  DetailImpact,
  ImpactThematique,
  LienBilanThematique,
  NiveauImpact,
} from '../../../../domain/bilan/bilanCarbone';
import { ThematiqueRepository } from '../../../repository/thematique.repository';
import { Thematique } from '../../../../domain/contenu/thematique';

export class DetailImpactAPI_v3 {
  @ApiProperty() label: string;
  @ApiProperty() emoji: string;
  @ApiProperty() pourcentage: number;
  @ApiProperty() pourcentage_categorie: number;
  @ApiProperty() impact_kg_annee: number;

  public static mapToAPI(detail: DetailImpact): DetailImpactAPI_v3 {
    return {
      label: detail.label,
      pourcentage: detail.pourcentage,
      pourcentage_categorie: detail.pourcentage_categorie,
      impact_kg_annee: detail.impact_kg_annee,
      emoji: detail.emoji,
    };
  }
}

export class ImpactThematiqueAPI_v3 {
  @ApiProperty() thematique: Thematique;
  @ApiProperty() pourcentage: number;
  @ApiProperty() impact_kg_annee: number;
  @ApiProperty() emoji: string;
  @ApiProperty({ type: [DetailImpactAPI_v3] }) details: DetailImpactAPI_v3[];

  public static mapToAPI(impact: ImpactThematique): ImpactThematiqueAPI_v3 {
    return {
      pourcentage: impact.pourcentage,
      thematique: impact.thematique,
      impact_kg_annee: impact.impact_kg_annee,
      details: impact.details.map((d) => DetailImpactAPI_v3.mapToAPI(d)),
      emoji: impact.emoji,
    };
  }
}
export class BilanCarboneCompletAPI_v3 {
  @ApiProperty({ type: [ImpactThematiqueAPI_v3] })
  impact_thematique: ImpactThematiqueAPI_v3[];
  @ApiProperty() impact_kg_annee: number;
  @ApiProperty({ type: [DetailImpactAPI_v3] }) top_3: DetailImpactAPI_v3[];

  public static mapToAPI(bilan: BilanCarbone): BilanCarboneCompletAPI_v3 {
    return {
      impact_kg_annee: bilan.impact_kg_annee,
      top_3: bilan.top_3,
      impact_thematique: bilan.impact_thematique.map((e) =>
        ImpactThematiqueAPI_v3.mapToAPI(e),
      ),
    };
  }
}

export class BilanCarboneApproximatifAPI_v3 {
  @ApiProperty({ enum: NiveauImpact })
  impact_transport: NiveauImpact;

  @ApiProperty({ enum: NiveauImpact })
  impact_alimentation: NiveauImpact;

  @ApiProperty({ enum: NiveauImpact })
  impact_logement: NiveauImpact;

  @ApiProperty({ enum: NiveauImpact })
  impact_consommation: NiveauImpact;

  public static mapToAPI(
    bilan: BilanCarboneSynthese,
  ): BilanCarboneApproximatifAPI_v3 {
    return {
      impact_transport: bilan.impact_transport,
      impact_alimentation: bilan.impact_alimentation,
      impact_logement: bilan.impact_logement,
      impact_consommation: bilan.impact_consommation,
    };
  }
}

export class LienBilanThematiqueAPI_v3 {
  @ApiProperty() thematique: Thematique;
  @ApiProperty() image_url: string;

  @ApiProperty()
  pourcentage_progression: number;

  @ApiProperty()
  nombre_total_question: number;
  @ApiProperty()
  temps_minutes: number;

  @ApiProperty()
  id_enchainement_kyc: string;

  public static mapToAPI(lien: LienBilanThematique): LienBilanThematiqueAPI_v3 {
    return {
      id_enchainement_kyc: lien.id_enchainement_kyc,
      image_url: lien.image_url,
      nombre_total_question: lien.nombre_total_question,
      pourcentage_progression: lien.pourcentage_progression,
      thematique: lien.thematique,
      temps_minutes: lien.temps_minutes,
    };
  }
}

export class BilanCarboneDashboardAPI_v3 {
  @ApiProperty()
  pourcentage_completion_totale: number;

  @ApiProperty({ type: BilanCarboneCompletAPI_v3 })
  bilan_complet: BilanCarboneCompletAPI_v3;

  @ApiProperty({ type: BilanCarboneApproximatifAPI_v3 })
  bilan_approximatif: BilanCarboneApproximatifAPI_v3;

  @ApiProperty({ type: [LienBilanThematiqueAPI_v3] })
  liens_bilans_thematique: LienBilanThematiqueAPI_v3[];

  public static mapToAPI(
    bilan_complet: BilanCarbone,
    bilan_synthese: BilanCarboneSynthese,
    force?: string,
  ): BilanCarboneDashboardAPI_v3 {
    return {
      pourcentage_completion_totale:
        bilan_synthese.pourcentage_completion_totale,
      bilan_complet:
        bilan_synthese.bilan_complet_dispo || force
          ? BilanCarboneCompletAPI_v3.mapToAPI(bilan_complet)
          : undefined,
      bilan_approximatif:
        bilan_synthese.mini_bilan_dispo || force
          ? BilanCarboneApproximatifAPI_v3.mapToAPI(bilan_synthese)
          : undefined,
      liens_bilans_thematique: bilan_synthese.liens_bilans_thematiques.map(
        (l) => LienBilanThematiqueAPI_v3.mapToAPI(l),
      ),
    };
  }
}
