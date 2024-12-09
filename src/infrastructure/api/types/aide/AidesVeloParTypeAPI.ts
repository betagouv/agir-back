import { ApiProperty } from '@nestjs/swagger';
import { AideVelo, AidesVeloParType } from 'src/domain/aides/aideVelo';

export class CollectiviteAPI {
  @ApiProperty({
    enum: ['pays', 'région', 'département', 'code insee', 'epci'],
  })
  kind: 'pays' | 'région' | 'département' | 'code insee' | 'epci';
  @ApiProperty() value: string;
  @ApiProperty() code?: string;

  public static mapToAPI(
    collectivite: AideVelo['collectivite'],
  ): CollectiviteAPI {
    return {
      kind: collectivite.kind,
      value: collectivite.value,
      code: collectivite.code,
    };
  }
}

export class AideVeloAPI {
  @ApiProperty()
  libelle: string;

  @ApiProperty({ nullable: true })
  montant: number | null;

  @ApiProperty({
    nullable: true,
    deprecated: true,
    description:
      "DEPRECATED - Reste d'ancien comportement, à supprimer (pour l'instant la valeur est égale au montant).",
  })
  plafond: number | null;

  @ApiProperty()
  lien: string;

  @ApiProperty({ type: CollectiviteAPI })
  collectivite: CollectiviteAPI;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  logo?: string;

  public static mapToAPI(aidesVelo: AideVelo): AideVeloAPI {
    return {
      libelle: aidesVelo.libelle,
      montant: aidesVelo.montant,
      plafond: aidesVelo.plafond,
      lien: aidesVelo.lien,
      collectivite: CollectiviteAPI.mapToAPI(aidesVelo.collectivite),
      description: aidesVelo.description,
      logo: aidesVelo.logo,
    };
  }
}

export class AidesVeloParTypeAPI {
  @ApiProperty({ type: [AideVeloAPI] })
  'mécanique simple': AideVeloAPI[];

  @ApiProperty({ type: [AideVeloAPI] })
  'électrique': AideVeloAPI[];

  @ApiProperty({ type: [AideVeloAPI] })
  'cargo': AideVeloAPI[];

  @ApiProperty({ type: [AideVeloAPI] })
  'cargo électrique': AideVeloAPI[];

  @ApiProperty({ type: [AideVeloAPI] })
  'pliant': AideVeloAPI[];

  @ApiProperty({ type: [AideVeloAPI] })
  'pliant électrique': AideVeloAPI[];

  @ApiProperty({ type: [AideVeloAPI] })
  'motorisation': AideVeloAPI[];

  @ApiProperty({ type: [AideVeloAPI] })
  'adapté': AideVeloAPI[];

  public static mapToAPI(
    aidesVeloParType: AidesVeloParType,
  ): AidesVeloParTypeAPI {
    const api: AidesVeloParTypeAPI = {
      'mécanique simple': [],
      électrique: [],
      cargo: [],
      'cargo électrique': [],
      pliant: [],
      'pliant électrique': [],
      motorisation: [],
      adapté: [],
    };

    for (const kind in aidesVeloParType) {
      if (kind in api) {
        api[kind] = aidesVeloParType[kind].map(AideVeloAPI.mapToAPI);
      }
    }

    return api;
  }
}
