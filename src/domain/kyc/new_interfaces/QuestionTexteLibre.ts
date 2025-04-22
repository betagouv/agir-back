import { QuestionKYC } from '../questionKYC';

export class QuestionTexteLibre {
  private kyc: QuestionKYC;

  constructor(kyc: QuestionKYC) {
    this.kyc = kyc;
  }

  public getCode(): string {
    return this.kyc.code;
  }
  public getKyc(): QuestionKYC {
    return this.kyc;
  }

  public isAnswered(): boolean {
    return this.kyc.hasAnySimpleResponse();
  }

  public getText(): string {
    return this.kyc.getReponseSimpleValue();
  }
  public setText(texte: string) {
    this.kyc.touch();
    this.kyc.setReponseSimpleValue(texte);
  }
}
