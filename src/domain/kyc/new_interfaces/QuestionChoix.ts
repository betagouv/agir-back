import { KYCID } from '../KYCID';
import { KYCComplexValues } from '../publicodesMapping';
import { QuestionKYC } from '../questionKYC';

export class QuestionChoix<ID extends KYCID> {
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

  public isSelected(code_reponse: KYCComplexValues[ID]['code']): boolean {
    const entry_liste = this.kyc.reponse_complexe;
    const found = entry_liste.find((r) => r.code === code_reponse);
    return found ? found.selected : false;
  }

  public getAllCodes(): KYCComplexValues[ID]['code'][] {
    return this.kyc.reponse_complexe.map((r) => r.code);
  }

  public getSelectedCodes(): KYCComplexValues[ID]['code'][] {
    if (!this.kyc.reponse_complexe) return [];
    const result = [];
    for (const rep of this.kyc.reponse_complexe) {
      if (rep.selected) {
        result.push(rep.code);
      }
    }
    return result;
  }

  public getNombreSelections() {
    if (!this.kyc.reponse_complexe) return 0;
    const entry_liste = this.kyc.reponse_complexe;
    let result = 0;
    for (const entry of entry_liste) {
      if (entry.selected) {
        result++;
      }
    }
    return result;
  }
}
