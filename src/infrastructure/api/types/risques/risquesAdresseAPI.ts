import { ApiProperty } from '@nestjs/swagger';
import { NiveauRisqueLogement } from '../../../../domain/logement/NiveauRisque';
import { TypeRisqueLogement } from '../../../../domain/logement/TypeRisque';

const TITRES: Record<TypeRisqueLogement, string> = {
  argile: `Risques retrait-gonflement des sols argileux`,
  inondation: `Risques d'inondations`,
  radon: `Risques d'exposition au radon`,
  secheresse: `Risques de sécheresse`,
  seisme: `Risques sismiques`,
  submersion: `Risques de submersion`,
  tempete: `Risques de tempêtes`,
};

export class RisquesAdresseAPI {
  @ApiProperty({ enum: TypeRisqueLogement }) type_risque: TypeRisqueLogement;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: NiveauRisqueLogement })
  niveau_risque: NiveauRisqueLogement;

  static mapToAPI(
    type: TypeRisqueLogement,
    score: NiveauRisqueLogement,
  ): RisquesAdresseAPI {
    return {
      type_risque: type,
      niveau_risque: score,
      titre: TITRES[type],
    };
  }
}
