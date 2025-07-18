import { KYCID } from '../KYCID';
import { KYCComplexValues } from '../publicodesMapping';
import { QuestionKYC } from '../questionKYC';
import { QuestionChoix } from './QuestionChoix';

export class QuestionChoixMultiple<ID extends KYCID> extends QuestionChoix<ID> {
  constructor(kyc: QuestionKYC) {
    super(kyc);
  }

  public select(code: KYCComplexValues[ID]['code']) {
    this.setCodeState(code, true);
  }

  public deselect(code: KYCComplexValues[ID]['code']) {
    this.setCodeState(code, false);
  }

  public setCodeState(code: KYCComplexValues[ID]['code'], selected: boolean) {
    this.kyc.touch();
    const entry_liste = this.kyc.reponse_complexe;

    for (const entry of entry_liste) {
      if (entry.code === code) {
        entry.selected = selected;
        return;
      }
    }
  }

  public deselectAll() {
    this.kyc.touch();
    const entry_liste = this.kyc.reponse_complexe;

    for (const entry of entry_liste) {
      entry.selected = false;
    }
  }
}
