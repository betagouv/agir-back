import { ApiProperty } from '@nestjs/swagger';
import {
  VoitureCarburant,
  VoitureGabarit,
  VoitureMotorisation,
} from 'src/domain/simulateur_voiture/resultats';
import type {
  Alternative,
  EvaluatedCarInfos,
  EvaluatedRuleInfos,
  TargetInfos,
} from '../../../../../node_modules/@betagouv/publicodes-voiture';

export class ValeurCalculeeAPI<T> {
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

  public static mapToAPI<T>(
    valeur: EvaluatedRuleInfos<T>,
  ): ValeurCalculeeAPI<T> {
    return {
      valeur: valeur.value,
      label: valeur.title,
      // NOTE: the following fields are not used in the current implementation
      // unite: valeur.unit,
      // enum: valeur.isEnumValue,
    };
  }
}

export class VoitureInfosAPI {
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
    description: 'Gabarit de la voiture',
    type: ValeurCalculeeAPI<VoitureGabarit>,
    example: {
      valeur: 'moyenne',
      label: 'Monospace',
    },
  })
  gabarit: ValeurCalculeeAPI<VoitureGabarit>;

  @ApiProperty({
    description:
      'Type de motorisation de la voiture (thermique, hybride, électrique)',
    type: ValeurCalculeeAPI<VoitureMotorisation>,
    example: {
      valeur: 'thermique',
      label: 'Thermique',
    },
  })
  motorisation: ValeurCalculeeAPI<VoitureMotorisation>;

  @ApiProperty({
    description:
      'Type de carburant de la voiture (essence, diesel, etc.). Seulement, si la voiture est thermique ou hybride.',
    type: ValeurCalculeeAPI<VoitureCarburant>,
    nullable: true,
    example: {
      valeur: 'essence E5 ou E10',
      label: 'Essence',
    },
  })
  carburant?: ValeurCalculeeAPI<VoitureCarburant>;

  public static mapToAPI(infos: EvaluatedCarInfos): VoitureInfosAPI {
    return {
      couts: infos.cost.value,
      empreinte: infos.emissions.value,
      gabarit: ValeurCalculeeAPI.mapToAPI(infos.size),
      motorisation: ValeurCalculeeAPI.mapToAPI(infos.motorisation),
      carburant: infos.fuel
        ? ValeurCalculeeAPI.mapToAPI(infos.fuel)
        : undefined,
    };
  }
}

export class AlternativeAPI extends VoitureInfosAPI {
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

  public static mapToAPI(alternative: Alternative): AlternativeAPI {
    return {
      titre: alternative.title,
      type: AlternativeAPI.mapKindToAPI(alternative.kind),
      ...VoitureInfosAPI.mapToAPI(alternative),
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
    type: ValeurCalculeeAPI<VoitureGabarit>,
    example: {
      valeur: 'moyenne',
      label: 'Monospace',
    },
  })
  gabarit: ValeurCalculeeAPI<VoitureGabarit>;

  @ApiProperty({
    description: 'Possibilité de recharger une voiture électrique',
    type: Boolean,
  })
  recharge: boolean;

  public static mapToAPI(infos: TargetInfos): VoitureCibleAPI {
    return {
      gabarit: ValeurCalculeeAPI.mapToAPI(infos.size),
      recharge: infos.hasChargingStation.value,
    };
  }
}
