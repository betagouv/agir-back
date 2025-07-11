import { Categorie } from '../contenu/categorie';
import { Thematique } from '../thematique/thematique';
import { KYCID } from './KYCID';
import { KYCMosaicID } from './mosaicDefinition';

export class KYCMosaicReponse {
  code: string;
  label: string;
  image_url: string;
  emoji: string;
  boolean_value: boolean;
}

export enum TypeMosaic {
  mosaic_boolean = 'mosaic_boolean',
  mosaic_number = 'mosaic_number',
}

export type MosaicKYCDef = {
  id: KYCMosaicID;
  titre: string;
  type: TypeMosaic;
  categorie: Categorie;
  points: number;
  question_kyc_codes: KYCID[];
  thematique: Thematique;
};
