import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../../src/domain/thematique';

export class CMSThematiqueAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;

  public static getThematique(cmsThematique: CMSThematiqueAPI): Thematique {
    return [
      Thematique.alimentation,
      Thematique.climat,
      Thematique.consommation,
      Thematique.dechet,
      Thematique.logement,
      Thematique.transport,
      Thematique.loisir,
    ][cmsThematique.id - 1];
  }
}
