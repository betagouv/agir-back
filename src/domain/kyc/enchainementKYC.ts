import { KYCHistory } from './kycHistory';
import { QuestionKYC } from './questionKYC';

export class EnchainementKYC {
  private liste_kyc: QuestionKYC[];
  private history: KYCHistory;
  private current_kyc: QuestionKYC;

  constructor(liste_kyc: QuestionKYC[], history: KYCHistory) {
    this.liste_kyc = liste_kyc;
    this.history = history;
  }

  public forceRewind() {
    this.current_kyc = this.liste_kyc[0];
  }

  public getNombreTotalQuestions(): number {
    return this.liste_kyc.length;
  }

  public getNombreTotalQuestionsEligibles(): number {
    let total = 0;
    for (const kyc of this.liste_kyc) {
      if (this.history.isKYCEligible(kyc)) {
        total++;
      }
    }
    return total;
  }

  public getPositionCourante(): number {
    if (!this.current_kyc) {
      return NaN;
    }
    let position = 1;
    for (const kyc of this.liste_kyc) {
      if (kyc.code === this.current_kyc.code) {
        return position;
      }
      if (this.history.isKYCEligible(kyc)) {
        position++;
      }
    }
  }

  public getKycCourante(): QuestionKYC {
    return this.current_kyc;
  }

  public setFirst(): QuestionKYC {
    this.current_kyc = this.getFirstEligibleNonRepondu();
    if (!this.current_kyc) {
      this.current_kyc = this.getFirstEligible();
    }
    return this.current_kyc;
  }

  public setNext(current_kyc_code: string): QuestionKYC {
    const next = this.getNext(current_kyc_code);
    this.current_kyc = next;
    return next;
  }

  public setPrevious(current_kyc_code: string): QuestionKYC {
    const previous = this.getPrevious(current_kyc_code);
    this.current_kyc = previous;
    return previous;
  }

  public isFirst() {
    if (!this.current_kyc) return false;
    const previous = this.getPrevious(this.current_kyc.code);
    return !previous;
  }

  public isLast() {
    if (!this.current_kyc) return false;
    const next = this.getNext(this.current_kyc.code);
    return !next;
  }

  private getFirstEligibleNonRepondu(): QuestionKYC {
    return this.liste_kyc.find(
      (k) => !k.is_answered && this.history.isKYCEligible(k),
    );
  }
  private getFirstEligible(): QuestionKYC {
    return this.liste_kyc.find((k) => this.history.isKYCEligible(k));
  }

  private getNext(current_kyc_code: string): QuestionKYC {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      return undefined;
    }
    for (let index = foundIndex + 1; index < this.liste_kyc.length; index++) {
      const current_kyc = this.liste_kyc[index];
      console.log(current_kyc);
      if (this.history.isKYCEligible(current_kyc)) {
        console.log('returned');
        return current_kyc;
      }
    }
    return undefined;
  }

  private getPrevious(current_kyc_code: string): QuestionKYC {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      return undefined;
    }
    for (let index = foundIndex - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (this.history.isKYCEligible(kyc)) {
        return kyc;
      }
    }
    return undefined;
  }
}
