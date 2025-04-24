import { QuestionKYC } from '../questionKYC';
import { QuestionSimple } from './QuestionSimple';

export class QuestionNumerique extends QuestionSimple {
  constructor(kyc: QuestionKYC) {
    super(kyc);
  }

  public getValue(): number {
    if (this.kyc.reponse_simple && this.kyc.reponse_simple.value) {
      return Number(this.kyc.reponse_simple.value);
    }
    return undefined;
  }

  public setValue(value: number) {
    this.setStringValue('' + value);
  }
}
