import { QuestionKYC, TypeReponseQuestionKYC } from '../questionKYC';

export class QuestionSimple {
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

  public setValue(value: string) {
    this.kyc.touch();
    return this.kyc.setReponseSimpleValue(value);
  }

  public isInteger(): boolean {
    return this.kyc.type === TypeReponseQuestionKYC.entier;
  }
  public isDecimal(): boolean {
    return this.kyc.type === TypeReponseQuestionKYC.decimal;
  }
  public isString(): boolean {
    return this.kyc.type === TypeReponseQuestionKYC.libre;
  }
}
