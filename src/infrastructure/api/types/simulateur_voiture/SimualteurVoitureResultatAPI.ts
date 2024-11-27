import {
  Alternative,
  CarInfos,
  EvaluatedRuleInfos,
  TargetInfos,
} from '@betagouv/publicodes-voiture';
import { ApiProperty } from '@nestjs/swagger';
import {
  SimulateurVoitureResultat,
  VoitureCarburant,
  VoitureGabarit,
  VoitureMotorisation,
} from 'src/domain/simulateur_voiture/resultats';

export class ValeurCalculeeAPI<T> {
  @ApiProperty({
    description: 'Valeur calculée par le le moteur Publicodes',
    example: 'moyenne',
  })
  valeur: T;

  @ApiProperty({
    description: 'Titre de la valeur calculée (à afficher)',
    example: 'Monospace',
    type: String,
    required: false,
  })
  titre?: string;

  // @ApiProperty({
  //   description: 'Unité de la valeur calculée',
  //   type: String,
  //   required: false,
  //   example: 'kgCO2e/an',
  // })
  // unite?: string;
  //
  // @ApiProperty({
  //   description:
  //     "Si la valeur correspond à une énumération (mécanisme 'une possibilité' de Publicodes)",
  //   example: true,
  //   type: Boolean,
  //   required: false,
  // })
  // enum?: boolean;

  public static mapToAPI<T>(
    valeur: EvaluatedRuleInfos<T>,
  ): ValeurCalculeeAPI<T> {
    return {
      valeur: valeur.value,
      titre: valeur.title,
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
      titre: 'Monospace',
    },
  })
  gabarit: ValeurCalculeeAPI<VoitureGabarit>;

  @ApiProperty({
    description:
      'Type de motorisation de la voiture (thermique, hybride, électrique)',
    type: ValeurCalculeeAPI<VoitureMotorisation>,
    example: {
      valeur: 'thermique',
      titre: 'Thermique',
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
      titre: 'Essence',
    },
  })
  carburant?: ValeurCalculeeAPI<VoitureCarburant>;

  public static mapToAPI(infos: CarInfos): VoitureInfosAPI {
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
    // FIXME: this should be automatically generated from the Altreantive['kind'] type
    enum: ['car'],
    description: "Type de l'alternative",
  })
  type: Alternative['kind'];

  public static mapToAPI(alternative: Alternative): AlternativeAPI {
    return {
      type: alternative.kind,
      ...VoitureInfosAPI.mapToAPI(alternative),
    };
  }
}

export class VoitureCibleAPI {
  @ApiProperty({
    description: 'Gabarit de la voiture cible',
    type: ValeurCalculeeAPI<VoitureGabarit>,
    example: {
      valeur: 'moyenne',
      titre: 'Monospace',
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

export class SimulateurVoitureResultatAPI {
  @ApiProperty({
    description: 'Résultats calculées pour la voiture actuelle',
    type: VoitureInfosAPI,
  })
  voiture_actuelle: VoitureInfosAPI;

  @ApiProperty({
    description: "Liste des alternatives à l'achat de la voiture actuelle",
    type: [AlternativeAPI],
  })
  alternatives: AlternativeAPI[];

  @ApiProperty({
    description: 'Informations sur la voiture cible (à acheter)',
    type: VoitureCibleAPI,
  })
  voiture_cible: VoitureCibleAPI;

  public static mapToAPI(
    resultat: SimulateurVoitureResultat,
  ): SimulateurVoitureResultatAPI {
    return {
      voiture_actuelle: VoitureInfosAPI.mapToAPI(resultat.voiture_actuelle),
      alternatives: resultat.alternatives.map(AlternativeAPI.mapToAPI),
      voiture_cible: VoitureCibleAPI.mapToAPI(resultat.voiture_cible),
    };
  }
}
