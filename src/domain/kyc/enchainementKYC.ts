import { EnchainementKYCExclude } from '../../infrastructure/api/types/kyc/enchainementKYCAPI';
import { KYCHistory } from './kycHistory';
import { QuestionKYC } from './questionKYC';

export class EnchainementKYC {
  private liste_kyc: QuestionKYC[];
  private history: KYCHistory;
  private current_kyc: QuestionKYC;
  private is_force_rewinded: boolean;

  constructor(liste_kyc: QuestionKYC[], history: KYCHistory) {
    this.liste_kyc = liste_kyc;
    this.history = history;
    this.is_force_rewinded = false;
  }

  public forceRewind() {
    this.current_kyc = this.liste_kyc[0];
    this.is_force_rewinded = true;
  }

  public getNombreTotalQuestionseffectives(
    excludes: EnchainementKYCExclude[],
  ): number {
    if (this.is_force_rewinded) {
      return this.liste_kyc.length;
    }
    if (excludes.length === 0) {
      return this.liste_kyc.length;
    }

    let total = 0;
    for (const kyc of this.liste_kyc) {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          if (kyc.is_answered) {
            continue; // on zap cette question, elle est répondu
          }
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          if (!this.history.isKYCEligible(kyc)) {
            continue; // on zap cette question, elle est pas pas eligible
          }
        }
        total++;
      } else {
        if (!this.history.isKYCEligible(kyc) || kyc.is_answered) {
          continue;
        }
        total++;
      }
    }
    return total;
  }

  public isCouranteEligible(): boolean {
    if (!this.current_kyc) {
      return false;
    }
    return this.history.isKYCEligible(this.current_kyc);
  }

  public getPositionCouranteWithExcludes(
    excludes: EnchainementKYCExclude[],
  ): number {
    if (!this.current_kyc) {
      return NaN;
    }
    let position = 1;
    for (const kyc of this.liste_kyc) {
      if (kyc.code === this.current_kyc.code) {
        return position;
      }
      if (excludes.length === 0) {
        position++;
      } else {
        if (excludes.length === 1) {
          if (excludes.includes(EnchainementKYCExclude.repondu)) {
            if (kyc.is_answered) {
              continue; // on zap cette question, elle est répondu
            }
          }
          if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
            if (!this.history.isKYCEligible(kyc)) {
              continue; // on zap cette question, elle est pas pas eligible
            }
          }
          position++;
        } else {
          if (!this.history.isKYCEligible(kyc) || kyc.is_answered) {
            continue;
          }
          position++;
        }
      }
    }
  }

  public getNombreTotalQuestions(): number {
    return this.liste_kyc.length;
  }

  public setFirstFromExcludes(excludes: EnchainementKYCExclude[]): QuestionKYC {
    this.current_kyc = this.getFirstWithExcludes(excludes);
    return this.current_kyc;
  }

  public setNextWithExcludes(
    current_kyc_code: string,
    excludes: EnchainementKYCExclude[],
  ): QuestionKYC {
    const next = this.getNextWithExcludes(current_kyc_code, excludes);
    this.current_kyc = next;
    return next;
  }

  public setPreviousWithExcludes(
    current_kyc_code: string,
    excludes: EnchainementKYCExclude[],
  ): QuestionKYC {
    const previous = this.getPreviousWithExcludes(current_kyc_code, excludes);
    this.current_kyc = previous;
    return previous;
  }

  public getNextWithExcludes(
    current_kyc_code: string,
    excludes: EnchainementKYCExclude[],
  ): QuestionKYC {
    if (excludes.length === 0) {
      return this.getNextKyc(current_kyc_code);
    } else {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          return this.getNextKycNonRepondu(current_kyc_code);
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          return this.getNextKycEligible(current_kyc_code);
        }
      } else {
        return this.getNextKycEligibleNonRepondu(current_kyc_code);
      }
    }
  }

  public isVeryFirst(): boolean {
    if (!this.current_kyc) return false;
    return this.liste_kyc[0].code === this.current_kyc.code;
  }

  public isFirst(excludes: EnchainementKYCExclude[]) {
    if (this.is_force_rewinded) {
      return true;
    }
    const first = this.getFirstWithExcludes(excludes);
    if (!first) return false;
    if (!this.current_kyc) return false;
    return first.code === this.current_kyc.code;
  }

  public isLast(excludes: EnchainementKYCExclude[]) {
    const last = this.getLastWithExcludes(excludes);
    if (!last) return false;
    if (!this.current_kyc) return false;
    return last.code === this.current_kyc.code;
  }

  public getKycCourante(): QuestionKYC {
    return this.current_kyc;
  }

  private getFirstWithExcludes(
    excludes: EnchainementKYCExclude[],
  ): QuestionKYC {
    if (excludes.length === 0) {
      return this.getFirst();
    } else {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          return this.getFirstKYCNonRepondue();
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          return this.getFirstKYCEligible();
        }
      } else {
        return this.getFirstKYCNonRepondueEligible();
      }
    }
  }

  private getFirst(): QuestionKYC {
    return this.liste_kyc[0];
  }

  private getFirstKYCNonRepondue(): QuestionKYC | undefined {
    return this.liste_kyc.find((k) => !k.is_answered);
  }

  private getFirstKYCNonRepondueEligible(): QuestionKYC | undefined {
    return this.liste_kyc.find(
      (k) => !k.is_answered && this.history.isKYCEligible(k),
    );
  }
  private getFirstKYCEligible(): QuestionKYC | undefined {
    return this.liste_kyc.find((k) => this.history.isKYCEligible(k));
  }

  private getLastKYCEligible(): QuestionKYC | undefined {
    for (let index = this.liste_kyc.length - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (this.history.isKYCEligible(kyc)) {
        return kyc;
      }
    }
    return undefined;
  }
  private getLastKYCNonRepondu(): QuestionKYC | undefined {
    for (let index = this.liste_kyc.length - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (!kyc.is_answered) {
        return kyc;
      }
    }
    return undefined;
  }
  private getLastKYCNonReponduEligible(): QuestionKYC | undefined {
    for (let index = this.liste_kyc.length - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (!kyc.is_answered && this.history.isKYCEligible(kyc)) {
        return kyc;
      }
    }
    return undefined;
  }

  private getLastWithExcludes(
    excludes: EnchainementKYCExclude[],
  ): QuestionKYC | undefined {
    if (excludes.length === 0) {
      return this.liste_kyc[this.liste_kyc.length - 1];
    } else {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          return this.getLastKYCNonRepondu();
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          return this.getLastKYCEligible();
        }
      } else {
        return this.getLastKYCNonReponduEligible();
      }
    }
  }

  private getNextKycEligible(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      return undefined;
    }
    for (let index = foundIndex + 1; index < this.liste_kyc.length; index++) {
      const current_kyc = this.liste_kyc[index];

      if (this.history.isKYCEligible(current_kyc)) {
        return current_kyc;
      }
    }
    return undefined;
  }

  private getNextKycEligibleNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      return undefined;
    }
    for (let index = foundIndex + 1; index < this.liste_kyc.length; index++) {
      const current_kyc = this.liste_kyc[index];

      if (this.history.isKYCEligible(current_kyc) && !current_kyc.is_answered) {
        return current_kyc;
      }
    }
    return undefined;
  }

  private getNextKyc(current_kyc_code: string): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      return undefined;
    }
    return this.liste_kyc[foundIndex + 1];
  }

  private getNextKycNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      return undefined;
    }
    for (let index = foundIndex + 1; index < this.liste_kyc.length; index++) {
      const current_kyc = this.liste_kyc[index];

      if (!current_kyc.is_answered) {
        return current_kyc;
      }
    }
    return undefined;
  }

  private getPreviousWithExcludes(
    current_kyc_code: string,
    excludes: EnchainementKYCExclude[],
  ): QuestionKYC {
    if (excludes.length === 0) {
      return this.getPreviousKyc(current_kyc_code);
    } else {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          return this.getPreviousKycNonRepondu(current_kyc_code);
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          return this.getPreviousKycEligible(current_kyc_code);
        }
      } else {
        return this.getPreviousKycEligibleNonRepondu(current_kyc_code);
      }
    }
  }

  private getPreviousKyc(current_kyc_code: string): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      return undefined;
    }
    return this.liste_kyc[foundIndex - 1];
  }

  private getPreviousKycNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      return undefined;
    }
    for (let index = foundIndex - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (!kyc.is_answered) {
        return kyc;
      }
    }
    return undefined;
  }

  private getPreviousKycEligible(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
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

  private getPreviousKycEligibleNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      return undefined;
    }
    for (let index = foundIndex - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (this.history.isKYCEligible(kyc) && !kyc.is_answered) {
        return kyc;
      }
    }
    return undefined;
  }
}
