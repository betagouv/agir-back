import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { Aide } from '../../../../../src/domain/aides/aide';
import { Thematique } from '../../../../../src/domain/contenu/thematique';
import { Besoin } from '../../../../../src/domain/aides/besoin';

export class AideAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty() contenu: string;
  @ApiProperty() url_simulateur: string;
  @ApiProperty() url_source: string;
  @ApiProperty() url_demande: string;
  @ApiProperty() is_simulateur: boolean;
  @ApiProperty() codes_postaux: string[];
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty({ type: [String] })
  thematiques_label: string[];
  @ApiProperty() montant_max: number;
  @ApiProperty() besoin: Besoin;
  @ApiProperty() besoin_desc: string;

  public static mapToAPI(aide: Aide): AideAPI {
    return {
      content_id: aide.content_id,
      titre: aide.titre,
      contenu: aide.contenu,
      url_simulateur: aide.url_simulateur,
      url_source: aide.url_source,
      url_demande: aide.url_demande,
      is_simulateur: aide.is_simulateur,
      codes_postaux: aide.codes_postaux,
      thematiques: aide.thematiques,
      thematiques_label: aide.thematiques.map((elem) =>
        ThematiqueRepository.getTitreThematique(elem),
      ),
      montant_max: aide.montant_max,
      besoin_desc: aide.besoin_desc,
      besoin: aide.besoin,
    };
  }
}
