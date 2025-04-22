import { QuestionKYC } from '../questionKYC';
import { QuestionChoix } from './QuestionChoix';

export class QuestionChoixMultiple extends QuestionChoix {
  constructor(kyc: QuestionKYC) {
    super(kyc);
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
