import { QuestionKYC } from '../questionKYC';
import { QuestionSimple } from './QuestionSimple';

export class QuestionNumerique extends QuestionSimple {
  constructor(kyc: QuestionKYC) {
    super(kyc);
  }

  public getValue(): number {
    return this.kyc.getReponseSimpleValueAsNumber();
  }

  public setValue(value: number) {
    this.setStringValue('' + value);
  }
}
