import { App } from '../app';
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
  is_answered?: boolean;

  static MOSAIC_CATALOGUE: MosaicKYCDef[] = [
    {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Quels modes de chauffage existent chez vous ?',
      type: TypeReponseMosaicKYC.mosaic_boolean,
      question_kyc_codes: [
        KYCID.KYC_chauffage_bois,
        KYCID.KYC_chauffage_fioul,
        KYCID.KYC_chauffage_gaz,
      ],
    },
    {
      id: KYCMosaicID.MOSAIC_CHAUFFAGE,
      categorie: Categorie.mission,
      points: 10,
      titre: 'Quels modes de chauffage existent chez vous ?',
      type: TypeReponseMosaicKYC.mosaic_boolean,
      question_kyc_codes: [
        KYCID.KYC_chauffage_bois,
        KYCID.KYC_chauffage_fioul,
        KYCID.KYC_chauffage_gaz,
        KYCID.KYC_chauffage_elec,
      ],
    },
  ];

  public static listMosaicIDs(): KYCMosaicID[] {
    return MosaicKYC.MOSAIC_CATALOGUE.filter(
      (m) => m.categorie !== Categorie.test || !App.isProd(),
    ).map((m) => m.id);
  }

  public static isMosaicID(id: string): boolean {
    return MosaicKYC.MOSAIC_CATALOGUE.findIndex((m) => m.id === id) > -1;
  }

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
        label: kyc.short_question,
        image_url: kyc.image_url,
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
