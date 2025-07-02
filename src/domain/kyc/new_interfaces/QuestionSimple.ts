import { QuestionKYC, TypeReponseQuestionKYC } from '../questionKYC';

export class QuestionSimple {
  protected kyc: QuestionKYC;

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
    return this.kyc.is_answered;
  }

  public setStringValue(value: string) {
    this.kyc.touch();
    this.kyc.reponse_simple.value = value;
  }
  public getStringValue() {
    return this.kyc.reponse_simple.value;
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
