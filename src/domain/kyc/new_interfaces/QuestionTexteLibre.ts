import { QuestionKYC } from '../questionKYC';
import { QuestionSimple } from './QuestionSimple';

export class QuestionTexteLibre extends QuestionSimple {
  constructor(kyc: QuestionKYC) {
    super(kyc);
  }

  public getText(): string {
    return this.kyc.getReponseSimpleValue();
  }
  public setText(texte: string) {
    this.setStringValue(texte);
  }
}
