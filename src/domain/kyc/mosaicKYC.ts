import { Categorie } from '../contenu/categorie';
import { KYCID } from './KYCID';
import { KYCMosaicID } from './KYCMosaicID';
import { QuestionKYC } from './questionKYC';

export class KYCMosaicReponse {
  code: string;
  label: string;
  image_url: string;
  boolean_value: boolean;
}

export enum TypeReponseMosaicKYC {
  mosaic_boolean = 'mosaic_boolean',
  mosaic_number = 'mosaic_number',
}

export class MosaicKYC {
  id: KYCMosaicID;
  titre: string;
  type: TypeReponseMosaicKYC;
  categorie: Categorie;
  points: number;
  reponses: KYCMosaicReponse[];

  static MOSAIC_CATALOGUE: MosaicKYCDef[] = [
    {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Quels modes de chauffage existes chez vous ?',
      type: TypeReponseMosaicKYC.mosaic_boolean,
      question_kyc_codes: [
        KYCID.KYC_chauffage_bois,
        KYCID.KYC_chauffage_fioul,
        KYCID.KYC_chauffage_gaz,
      ],
    },
  ];

  static findMosaicDefByID(mosaicID: KYCMosaicID) {
    if (!mosaicID) return null;
    return MosaicKYC.MOSAIC_CATALOGUE.find((m) => m.id === mosaicID);
  }

  constructor(liste_kyc: QuestionKYC[], mosaic_def: MosaicKYCDef) {
    this.id = mosaic_def.id;
    this.titre = mosaic_def.titre;
    this.type = mosaic_def.type;
    this.categorie = mosaic_def.categorie;
    this.points = mosaic_def.points;
    this.reponses = [];

    if (mosaic_def.type === TypeReponseMosaicKYC.mosaic_boolean) {
      this.reponses = this.buildBooleanResponseListe(liste_kyc);
    }
  }

  private buildBooleanResponseListe(
    kyc_liste: QuestionKYC[],
  ): KYCMosaicReponse[] {
    const liste_reponses: KYCMosaicReponse[] = [];
    for (const kyc of kyc_liste) {
      let value = 'non';
      if (kyc.hasAnyResponses()) {
        value = kyc.reponses[0].code;
      }
      const new_reponse: KYCMosaicReponse = {
        code: kyc.id,
        label: kyc.question,
        image_url: null,
        boolean_value: value === 'oui',
      };
      liste_reponses.push(new_reponse);
    }
    return liste_reponses;
  }
}

export type MosaicKYCDef = {
  id: KYCMosaicID;
  titre: string;
  type: TypeReponseMosaicKYC;
  categorie: Categorie;
  points: number;
  question_kyc_codes: KYCID[];
};
