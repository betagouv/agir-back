import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { Aide } from '../../../../../src/domain/aides/aide';
import { Thematique } from '../../../../../src/domain/contenu/thematique';

export class AideAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty() contenu: string;
  @ApiProperty() url_simulateur: string;
  @ApiProperty() is_simulateur: boolean;
  @ApiProperty() codes_postaux: string[];
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty({ type: [String] })
  thematiques_label: string[];
  @ApiProperty() montant_max: number;

  public static mapToAPI(aide: Aide): AideAPI {
    return {
      content_id: aide.content_id,
      titre: aide.titre,
      contenu: aide.contenu,
      url_simulateur: aide.url_simulateur,
      is_simulateur: aide.is_simulateur,
      codes_postaux: aide.codes_postaux,
      thematiques: aide.thematiques,
      thematiques_label: aide.thematiques.map((elem) =>
        ThematiqueRepository.getLibelleThematique(elem),
      ),
      montant_max: aide.montant_max,
    };
  }
}
