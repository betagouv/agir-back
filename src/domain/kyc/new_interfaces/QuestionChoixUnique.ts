import { QuestionKYC } from '../questionKYC';
import { KYCReponseComplexe } from '../QuestionKYCData';
import { QuestionChoix } from './QuestionChoix';

export class QuestionChoixUnique extends QuestionChoix {
  constructor(kyc: QuestionKYC) {
    super(kyc);
  }

  public getSelectedCode(): string {
    return this.kyc.getSelectedCode();
  }

  public getSelectedNgcCode(): string {
    return this.kyc.getSelectedNgcCode();
  }

  public selectByCode(code: string) {
    if (!this.kyc.reponse_complexe) return;
    this.kyc.touch();
    for (const rep of this.kyc.reponse_complexe) {
      rep.selected = rep.code === code;
    }
  }

  public selectByCodeNgc(code_ngc: string): boolean {
    this.kyc.touch();
    const code = this.getCodeByNGCCode(code_ngc);
    if (code) {
      this.selectByCode(code);
      return true;
    }
    return false;
  }

  private getCodeByNGCCode(ngc_code: string): string {
    if (!this.kyc.reponse_complexe) {
      return null;
    }
    const q = this.getQuestionComplexeByNgcCode(ngc_code);
    return q ? q.code : null;
  }

  private getQuestionComplexeByNgcCode(ngc_code: string): KYCReponseComplexe {
    if (!this.kyc.reponse_complexe) return null;
    return this.kyc.reponse_complexe.find((r) => r.ngc_code === ngc_code);
  }
}
