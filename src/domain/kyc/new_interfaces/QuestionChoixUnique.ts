import { QuestionKYC } from '../questionKYC';

export class QuestionChoixUnique {
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
    return this.kyc.hasAnyComplexeResponse();
  }

  public getSelectedCode(): string {
    return this.kyc.getSelected();
  }

  public selectByCode(code: string) {
    this.kyc.touch();
    this.kyc.selectChoixUniqueByCode(code);
  }
  public selectByCodeNgc(code_ngc: string): boolean {
    this.kyc.touch();
    const code = this.kyc.getCodeByNGCCode(code_ngc);
    if (code) {
      this.selectByCode(code);
      return true;
    }
    return false;
  }
}
