import { ApiProperty } from '@nestjs/swagger';
import { AideDefinition } from '../../../../domain/aides/aideDefinition';
import { Thematique } from '../../../../domain/thematique/thematique';

export class AideExportAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty() contenu: string;
  @ApiProperty() echelle: string;
  @ApiProperty() url_source: string;
  @ApiProperty() url_demande: string;
  @ApiProperty() codes_postaux: string;
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty() montant_max: number;
  @ApiProperty() codes_departement: string;
  @ApiProperty() codes_region: string;
  @ApiProperty() metropoles: string;
  @ApiProperty() com_agglo: string;
  @ApiProperty() com_urbaine: string;
  @ApiProperty() com_com: string;

  public static mapToAPI(aide: AideDefinition): AideExportAPI {
    return {
      content_id: aide.content_id,
      titre: aide.titre,
      contenu: aide.contenu,
      codes_postaux: aide.codes_postaux.join('|'),
      thematiques: aide.thematiques,
      montant_max: aide.montant_max,
      codes_departement: aide.codes_departement.join('|'),
      codes_region: aide.codes_region.join('|'),
      com_agglo: aide.ca.join('|'),
      com_urbaine: aide.cu.join('|'),
      com_com: aide.cc.join('|'),
      metropoles: aide.metropoles.join('|'),
      echelle: aide.echelle,
      url_source: aide.url_source,
      url_demande: aide.url_demande,
    };
  }
}
