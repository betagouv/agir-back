import { KYCID } from '../KYCID';
import { KYCComplexValues } from '../publicodesMapping';
import { QuestionKYC } from '../questionKYC';
import { KYCReponseComplexe } from '../QuestionKYCData';
import { QuestionChoix } from './QuestionChoix';

export class QuestionChoixUnique<ID extends KYCID> extends QuestionChoix<ID> {
  constructor(kyc: QuestionKYC) {
    super(kyc);
  }

  public getSelectedCode(): KYCComplexValues[ID]['code'] {
    return this.kyc.getSelectedCode();
  }

  public getSelectedNgcCode(): KYCComplexValues[ID]['ngc_code'] {
    return this.kyc.getSelectedNgcCode();
  }

  public selectByCode(code: KYCComplexValues[ID]['code']): void {
    if (!this.kyc.reponse_complexe) return;
    this.kyc.touch();
    for (const rep of this.kyc.reponse_complexe) {
      rep.selected = rep.code === code;
    }
  }

  public selectByCodeNgc(code_ngc: KYCComplexValues[ID]['ngc_code']): boolean {
    this.kyc.touch();
    const code = this.getCodeByNGCCode(code_ngc);
    if (code) {
      this.selectByCode(code);
      return true;
    }
    return false;
  }

  private getCodeByNGCCode(
    ngc_code: KYCComplexValues[ID]['ngc_code'],
  ): KYCComplexValues[ID]['code'] | null {
    if (!this.kyc.reponse_complexe) {
      return null;
    }
    const q = this.getQuestionComplexeByNgcCode(ngc_code);
    return q ? q.code : null;
  }

  private getQuestionComplexeByNgcCode(
    ngc_code: KYCComplexValues[ID]['ngc_code'],
  ): KYCReponseComplexe | null {
    if (!this.kyc.reponse_complexe) return null;
    return this.kyc.reponse_complexe.find((r) => r.ngc_code === ngc_code);
  }
}
