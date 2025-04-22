import { QuestionKYC } from '../questionKYC';
import { QuestionChoix } from './QuestionChoix';

export class QuestionChoixUnique extends QuestionChoix {
  constructor(kyc: QuestionKYC) {
    super(kyc);
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
