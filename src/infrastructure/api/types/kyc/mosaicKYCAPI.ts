import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../domain/contenu/categorie';
import {
  KYCMosaicReponse,
  MosaicKYC,
  TypeReponseMosaicKYC,
} from '../../../../domain/kyc/mosaicKYC';

export class KYCMosaicReponseAPI {
  @ApiProperty() code: string;
  @ApiProperty() label: string;
  @ApiProperty() image_url: string;
  @ApiProperty() boolean_value: boolean;

  public static mapToAPI(reponse: KYCMosaicReponse): KYCMosaicReponseAPI {
    return {
      code: reponse.code,
      image_url: reponse.image_url,
      label: reponse.label,
      boolean_value: reponse.boolean_value,
    };
  }
}

export class MosaicKYCAPI {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titre: string;

  @ApiProperty({ enum: TypeReponseMosaicKYC })
  type: TypeReponseMosaicKYC;

  @ApiProperty({ enum: Categorie })
  categorie: Categorie;

  @ApiProperty()
  points: number;

  @ApiProperty({ type: [KYCMosaicReponseAPI] })
  reponses: KYCMosaicReponseAPI[];

  public static mapToAPI(mosaic: MosaicKYC): MosaicKYCAPI {
    return {
      id: mosaic.id,
      titre: mosaic.titre,
      reponses: mosaic.reponses.map((r) => KYCMosaicReponseAPI.mapToAPI(r)),
      categorie: mosaic.categorie,
      points: mosaic.points,
      type: mosaic.type,
    };
  }
}
