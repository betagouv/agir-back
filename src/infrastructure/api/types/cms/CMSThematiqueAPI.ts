import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/contenu/thematique';

export class CMSThematiqueAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;

  public static getThematique(cmsThematique: CMSThematiqueAPI): Thematique {
    return CMSThematiqueAPI.getThematiqueByCmsId(cmsThematique.id);
  }

  public static getThematiqueByCmsId(cms_id: number): Thematique {
    if (cms_id > Object.values(Thematique).length) {
      return undefined;
    } else {
      return [
        Thematique.alimentation,
        Thematique.climat,
        Thematique.consommation,
        Thematique.dechet,
        Thematique.logement,
        Thematique.transport,
        Thematique.loisir,
      ][cms_id - 1];
    }
  }

  public static getThematiqueList(list: CMSThematiqueAPI[]) {
    return list.map((thematique) => CMSThematiqueAPI.getThematique(thematique));
  }
}
