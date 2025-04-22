import { QuestionKYC } from '../questionKYC';

export class QuestionNumerique {
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

  public getValue(): number {
    return this.kyc.getReponseSimpleValueAsNumber();
  }
  public setValue(value: number) {
    this.kyc.touch();
    this.kyc.setReponseSimpleValue('' + value);
  }
}
