import { ApiProperty } from '@nestjs/swagger';
import {
  BilanCarbone,
  BilanCarboneSynthese,
  DetailImpact,
  ImpactThematique,
  LienBilanThematique,
  NiveauImpact,
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
  @ApiProperty() emoji: string;
  @ApiProperty({ type: [DetailImpactAPI] }) details: DetailImpactAPI[];

  public static mapToAPI(impact: ImpactThematique): ImpactUniversAPI {
    return {
      pourcentage: impact.pourcentage,
      univers: impact.thematique,
      univers_label: ThematiqueRepository.getTitreThematique(impact.thematique),
      impact_kg_annee: impact.impact_kg_annee,
      details: impact.details.map((d) => DetailImpactAPI.mapToAPI(d)),
      emoji: impact.emoji,
    };
  }
}
export class BilanCarboneCompletAPI {
  @ApiProperty({ type: [ImpactUniversAPI] })
  impact_univers: ImpactUniversAPI[];
  @ApiProperty() impact_kg_annee: number;
  @ApiProperty({ type: [DetailImpactAPI] }) top_3: DetailImpactAPI[];

  public static mapToAPI(bilan: BilanCarbone): BilanCarboneCompletAPI {
    return {
      impact_kg_annee: bilan.impact_kg_annee,
      top_3: bilan.top_3,
      impact_univers: bilan.impact_thematique.map((e) =>
        ImpactUniversAPI.mapToAPI(e),
      ),
    };
  }
}

export class BilanCarboneApproximatifAPI {
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
  ): BilanCarboneApproximatifAPI {
    return {
      impact_transport: bilan.impact_transport,
      impact_alimentation: bilan.impact_alimentation,
      impact_logement: bilan.impact_logement,
      impact_consommation: bilan.impact_consommation,
    };
  }
}

export class LienBilanUniversAPI {
  @ApiProperty() univers: Univers;
  @ApiProperty() univers_label: string;
  @ApiProperty() image_url: string;

  @ApiProperty()
  pourcentage_progression: number;

  @ApiProperty()
  nombre_total_question: number;
  @ApiProperty()
  temps_minutes: number;

  @ApiProperty()
  id_enchainement_kyc: string;

  public static mapToAPI(lien: LienBilanThematique): LienBilanUniversAPI {
    return {
      id_enchainement_kyc: lien.id_enchainement_kyc,
      image_url: lien.image_url,
      nombre_total_question: lien.nombre_total_question,
      pourcentage_progression: lien.pourcentage_progression,
      univers: lien.thematique,
      univers_label: ThematiqueRepository.getTitreThematique(lien.thematique),
      temps_minutes: lien.temps_minutes,
    };
  }
}

export class BilanCarboneDashboardAPI_v2 {
  @ApiProperty()
  pourcentage_completion_totale: number;

  @ApiProperty({ type: BilanCarboneCompletAPI })
  bilan_complet: BilanCarboneCompletAPI;

  @ApiProperty({ type: BilanCarboneApproximatifAPI })
  bilan_approximatif: BilanCarboneApproximatifAPI;

  @ApiProperty({ type: [LienBilanUniversAPI] })
  liens_bilans_univers: LienBilanUniversAPI[];

  public static mapToAPI(
    bilan_complet: BilanCarbone,
    bilan_synthese: BilanCarboneSynthese,
    force?: string,
  ): BilanCarboneDashboardAPI_v2 {
    return {
      pourcentage_completion_totale:
        bilan_synthese.pourcentage_completion_totale,
      bilan_complet:
        bilan_synthese.bilan_complet_dispo || force
          ? BilanCarboneCompletAPI.mapToAPI(bilan_complet)
          : undefined,
      bilan_approximatif:
        bilan_synthese.mini_bilan_dispo || force
          ? BilanCarboneApproximatifAPI.mapToAPI(bilan_synthese)
          : undefined,
      liens_bilans_univers: bilan_synthese.liens_bilans_thematiques.map((l) =>
        LienBilanUniversAPI.mapToAPI(l),
      ),
    };
  }
}
