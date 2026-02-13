import { ApiProperty } from '@nestjs/swagger';
import {
  Alternative,
  EvaluatedCarInfos,
  EvaluatedRuleInfos,
  TargetInfos,
} from 'publicodes-voiture-v2';
import {
  VoitureCarburant,
  VoitureGabarit,
  VoitureMotorisation,
} from '../../../../domain/simulateur_voiture/resultats';

export class ValeurCalculeeAPI_v2<T> {
  @ApiProperty({
    description: 'Valeur calculée par le le moteur Publicodes',
    example: 'moyenne',
  })
  valeur: T;

  @ApiProperty({
    description: 'Nom de la valeur calculée (à afficher)',
    example: 'Monospace',
    type: String,
    required: false,
  })
  label?: string;

  @ApiProperty({
    description: 'Unité de la valeur calculée',
    type: String,
    required: false,
    example: 'kgCO2e/an',
  })
  unite?: string;

  @ApiProperty({
    description: 'Applicabilité de la valeur calculée',
    type: Boolean,
    required: false,
  })
  est_applicable?: boolean;

  public static mapToAPI<T>(
    valeur: EvaluatedRuleInfos<T>,
  ): ValeurCalculeeAPI_v2<T> {
    return {
      valeur: valeur.value,
      label: valeur.title,
      unite: valeur.unit,
      est_applicable: valeur.isApplicable,
    };
  }
}

export class VoitureParams {
  @ApiProperty({
    description: 'Identifiant du paramètre',
    type: String,
    example: 'voiture . gabarit',
  })
  id: string;

  @ApiProperty({
    description: 'Label du paramètre',
    type: String,
  })
  nom: string;

  @ApiProperty({
    description: 'Valeur du paramètre',
    type: String,
  })
  valeur: string;

  @ApiProperty({
    description: 'Unité du paramètre',
    type: String,
    required: false,
  })
  unite?: string;

  static mapToAPI(
    param: EvaluatedRuleInfos<string | number | boolean | undefined>,
  ): VoitureParams {
    const formatValue = (
      value: string | number | boolean | undefined,
    ): string => {
      if (value === undefined) {
        return 'Non renseigné';
      }
      if (typeof value === 'boolean') {
        return value ? 'Oui' : 'Non';
      }
      if (typeof value === 'number') {
        return value.toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      }
      return value;
    };

    return {
      id: param.ruleName,
      nom: param.title,
      valeur: formatValue(param.value),
      unite: param.unit || '',
    };
  }
}

export class VoitureInfosAPI_v2 {
  @ApiProperty({
    description: 'Coût annuel de la voiture (en €/an)',
    type: Number,
  })
  couts: number;

  @ApiProperty({
    description: 'Empreinte carbone annuelle de la voiture (en kgCO2e/an)',
    type: Number,
  })
  empreinte: number;

  @ApiProperty({
    description: 'Taille de la voiture (gabarit)',
    type: ValeurCalculeeAPI_v2<VoitureGabarit>,
    example: {
      valeur: 'moyenne',
      label: 'Monospace',
    },
  })
  gabarit: ValeurCalculeeAPI_v2<VoitureGabarit>;

  @ApiProperty({
    description: 'Motorisation de la voiture',
    type: ValeurCalculeeAPI_v2<VoitureMotorisation>,
    example: {
      valeur: 'thermique',
      label: 'Thermique',
    },
  })
  motorisation: ValeurCalculeeAPI_v2<VoitureMotorisation>;

  @ApiProperty({
    description: 'Carburant de la voiture (si applicable)',
    type: ValeurCalculeeAPI_v2<VoitureCarburant>,
    example: {
      valeur: 'essence',
      label: 'Essence',
    },
    required: false,
  })
  carburant?: ValeurCalculeeAPI_v2<VoitureCarburant>;

  @ApiProperty({
    description: 'Liste des paramètres utilisés pour la simulation',
    type: [VoitureParams],
    required: false,
  })
  params?: VoitureParams[];

  @ApiProperty({
    description: "Si la voiture est d'occasion",
    type: Boolean,
    example: true,
  })
  est_occasion: boolean;

  public static mapToAPI(infos: EvaluatedCarInfos): VoitureInfosAPI_v2 {
    return {
      gabarit: ValeurCalculeeAPI_v2.mapToAPI(infos.size),
      motorisation: ValeurCalculeeAPI_v2.mapToAPI(infos.motorisation),
      carburant: infos.fuel
        ? ValeurCalculeeAPI_v2.mapToAPI(infos.fuel)
        : undefined,
      couts: infos.cost.total.value,
      empreinte: infos.emissions.total.value,
      est_occasion: infos.occasion.value,
      params: infos.parameters
        ? infos.parameters.map(VoitureParams.mapToAPI)
        : undefined,
    };
  }
}

export class AlternativeAPI_v2 extends VoitureInfosAPI_v2 {
  @ApiProperty({
    // FIXME: this should be automatically generated from the Alternative['kind'] type
    enum: ['voiture-individuelle'],
    description:
      "Type de l'alternative (pour l'instant, il n'existe qu'un seul type d'alternative mais cela pourrait évoluer)",
  })
  type: 'voiture-individuelle';

  @ApiProperty({
    description: "Titre de l'alternative",
    type: String,
    example: 'Citadine électrique',
  })
  titre?: string;

  @ApiProperty({
    description:
      "Différence d'empreinte carbone par rapport à la voiture actuelle (en kgCO2e/an)",
    type: Number,
    example: 1000,
  })
  diff_emissions: number;

  @ApiProperty({
    description:
      'Différence de coût par rapport à la voiture actuelle (en €/an)',
    type: Number,
    example: 1000,
  })
  diff_couts: number;

  @ApiProperty({
    description:
      "Coût d'achat net (prix d'achat - valeur de revente de la voiture actuelle - aides) (en €)",
    type: ValeurCalculeeAPI_v2<number>,
    example: {
      est_applicable: true,
      label: "Coût d'achat net",
      unite: '€',
      valeur: 16000,
    },
  })
  cout_achat_net: ValeurCalculeeAPI_v2<number>;

  @ApiProperty({
    description: "Prix d'achat de l'alternative (en €)",
    type: ValeurCalculeeAPI_v2<number>,
    example: {
      est_applicable: true,
      label: "Prix d'achat",
      unite: '€',
      valeur: 20000,
    },
  })
  prix_achat: ValeurCalculeeAPI_v2<number>;

  @ApiProperty({
    description: 'Valeur de revente de la voiture actuelle (en €)',
    type: ValeurCalculeeAPI_v2<number>,
    example: {
      est_applicable: true,
      label: 'Valeur de revente actuelle',
      unite: '€',
      valeur: 4000,
    },
  })
  valeur_revente_actuelle: ValeurCalculeeAPI_v2<number>;

  @ApiProperty({
    description: 'Montant des aides (en €)',
    type: ValeurCalculeeAPI_v2<number>,
    example: {
      est_applicable: true,
      label: 'Montant des aides',
      unite: '€',
      valeur: 2000,
    },
  })
  montant_aides: ValeurCalculeeAPI_v2<number>;

  @ApiProperty({
    description: 'Durée pour atteindre le seuil de rentabilité (en années)',
    type: ValeurCalculeeAPI_v2<number>,
    example: {
      est_applicable: true,
      label: 'Durée seuil rentabilité',
      unite: 'an',
      valeur: 5,
    },
  })
  duree_seuil_rentabilite: ValeurCalculeeAPI_v2<number>;

  @ApiProperty({
    description: 'Économies totales sur la durée de possession (en €)',
    type: ValeurCalculeeAPI_v2<number>,
    example: {
      est_applicable: true,
      label: 'Économies totales sur la durée de possession',
      unite: '€',
      valeur: 5000,
    },
  })
  economies_totales: ValeurCalculeeAPI_v2<number>;

  public static mapToAPI(alternative: Alternative): AlternativeAPI_v2 {
    return {
      titre: alternative.title,
      type: AlternativeAPI_v2.mapKindToAPI(alternative.kind),
      diff_emissions: alternative.diff_emissions,
      diff_couts: alternative.diff_costs,
      cout_achat_net: ValeurCalculeeAPI_v2.mapToAPI(
        alternative.profitability.costOfPurchase,
      ),
      prix_achat: ValeurCalculeeAPI_v2.mapToAPI(alternative.cost.purchase),
      valeur_revente_actuelle: ValeurCalculeeAPI_v2.mapToAPI(
        alternative.profitability.currentCarResaleValue,
      ),
      montant_aides: ValeurCalculeeAPI_v2.mapToAPI(
        alternative.profitability.aids,
      ),
      duree_seuil_rentabilite: ValeurCalculeeAPI_v2.mapToAPI(
        alternative.profitability.duration,
      ),
      economies_totales: ValeurCalculeeAPI_v2.mapToAPI(
        alternative.profitability.totalSavings,
      ),
      ...VoitureInfosAPI_v2.mapToAPI(alternative),
    };
  }

  public static mapKindToAPI(
    kind: Alternative['kind'],
  ): 'voiture-individuelle' {
    switch (kind) {
      case 'car': {
        return 'voiture-individuelle';
      }
    }
  }
}

export class VoitureCibleAPI {
  @ApiProperty({
    description: 'Gabarit de la voiture cible',
    type: ValeurCalculeeAPI_v2<VoitureGabarit>,
    example: {
      valeur: 'moyenne',
      label: 'Monospace',
    },
  })
  gabarit: ValeurCalculeeAPI_v2<VoitureGabarit>;

  @ApiProperty({
    description: 'Possibilité de recharger une voiture électrique',
    type: Boolean,
  })
  recharge: boolean;

  public static mapToAPI(infos: TargetInfos): VoitureCibleAPI {
    return {
      gabarit: ValeurCalculeeAPI_v2.mapToAPI(infos.size),
      recharge: infos.hasChargingStation.value,
    };
  }
}
