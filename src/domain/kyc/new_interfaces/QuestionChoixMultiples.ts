import { QuestionKYC } from '../questionKYC';

export class QuestionChoixMultiple {
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

  public getAllCodes(): string[] {
    return this.kyc.getRAWListeReponsesComplexes().map((r) => r.code);
  }

  public select(code: string) {
    this.setCodeState(code, true);
  }
  public deselect(code: string) {
    this.setCodeState(code, false);
  }

  public setCodeState(code: string, selected: boolean) {
    this.kyc.touch();
    const entry_liste = this.kyc.getRAWListeReponsesComplexes();
    for (const entry of entry_liste) {
      if (entry.code === code) {
        entry.selected = selected;
        return;
      }
    }
  }
  public deselectAll() {
    this.kyc.touch();
    const entry_liste = this.kyc.getRAWListeReponsesComplexes();
    for (const entry of entry_liste) {
      entry.selected = false;
    }
  }
}
