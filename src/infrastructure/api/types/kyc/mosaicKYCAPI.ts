import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../domain/contenu/categorie';
import {
  KYCMosaicReponse,
  MosaicKYC_CATALOGUE,
  TypeMosaic,
} from '../../../../domain/kyc/mosaicKYC';
import {
  KYCReponseComplexe,
  QuestionKYC,
} from '../../../../domain/kyc/questionKYC';

export class KYCMosaicReponseAPI {
  @ApiProperty() code: string;
  @ApiProperty() label: string;
  @ApiProperty() image_url: string;
  @ApiProperty() emoji: string;
  @ApiProperty() boolean_value: boolean;

  public static mapToAPI(reponse: KYCReponseComplexe): KYCMosaicReponseAPI {
    return {
      code: reponse.code,
      image_url: reponse.image_url,
      label: reponse.label,
      boolean_value: QuestionKYC.isTrueBooleanString(reponse.value),
      emoji: reponse.emoji,
    };
  }
}

export class MosaicKYCAPI {
  @ApiProperty()
  id: string;

  @ApiProperty()
  is_answered: boolean;

  @ApiProperty()
  titre: string;

  @ApiProperty({ enum: TypeMosaic })
  type: TypeMosaic;

  @ApiProperty({ enum: Categorie })
  categorie: Categorie;

  @ApiProperty()
  points: number;

  @ApiProperty({ type: [KYCMosaicReponseAPI] })
  reponses: KYCMosaicReponseAPI[];

  public static mapToAPI(mosaic: QuestionKYC): MosaicKYCAPI {
    return {
      id: mosaic.code,
      titre: mosaic.question,
      reponses: mosaic
        .getListeReponsesComplexes()
        .map((r) => KYCMosaicReponseAPI.mapToAPI(r)),
      categorie: mosaic.categorie,
      points: mosaic.points,
      type: TypeMosaic[mosaic.type],
      is_answered: mosaic.is_mosaic_answered,
    };
  }
}
