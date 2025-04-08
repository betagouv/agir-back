import { EnchainementKYCExclude } from '../../infrastructure/api/types/kyc/enchainementKYCAPI';
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

  public setCurrentKYC(kyc: QuestionKYC) {
    this.current_kyc = kyc;
  }

  public getNombreTotalQuestionsEligibles(): number {
    let total = 0;
    for (const kyc of this.liste_kyc) {
      total += this.history.isKYCEligible(kyc) ? 1 : 0;
    }
    return total;
  }

  public getNombreTotalQuestionseffectives(
    excludes: EnchainementKYCExclude[],
  ): number {
    let total = 0;
    for (const kyc of this.liste_kyc) {
      if (excludes.length === 0) {
        total++;
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
          total++;
        } else {
          if (!this.history.isKYCEligible(kyc) || kyc.is_answered) {
            continue;
          }
          total++;
        }
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

  public getPositionCouranteDansEligibles(): number {
    if (!this.current_kyc) {
      return NaN;
    }
    if (!this.history.isKYCEligible(this.current_kyc)) {
      return NaN;
    }
    let index_result = 0;
    for (const kyc of this.liste_kyc) {
      if (kyc.code === this.current_kyc.code) {
        return index_result;
      }
      if (this.history.isKYCEligible(kyc)) {
        index_result++;
      }
    }
    return NaN;
  }
  public getPositionCourante(): number {
    if (!this.current_kyc) {
      return NaN;
    }
    const found_index = this.liste_kyc.findIndex(
      (k) => k.code === this.current_kyc.code,
    );
    if (found_index !== -1) {
      return found_index;
    } else {
      return NaN;
    }
  }

  public getNombreTotalQuestions(): number {
    return this.liste_kyc.length;
  }

  public setFirst(): QuestionKYC {
    this.current_kyc = this.liste_kyc[0];
    return this.current_kyc;
  }
  public setFirstToAnswer(): QuestionKYC {
    for (const kyc of this.liste_kyc) {
      if (!kyc.is_answered) {
        this.current_kyc = kyc;
        return kyc;
      }
    }
    return undefined;
  }

  public isCurrentFirstEligible(): boolean {
    const first = this.getFirstKYCEligible();
    if (!first) return false;
    if (!this.current_kyc) return false;
    return first.code === this.current_kyc.code;
  }
  public isCurrentLastEligible(): boolean {
    const last = this.getLastKYCEligible();
    if (!last) return false;
    if (!this.current_kyc) return false;
    return last.code === this.current_kyc.code;
  }

  public setFirstToAnswerEligible(): QuestionKYC {
    for (const kyc of this.liste_kyc) {
      if (!kyc.is_answered && this.history.isKYCEligible(kyc)) {
        this.current_kyc = kyc;
        return kyc;
      }
    }
    return undefined;
  }

  public setFirstEligible(): QuestionKYC | undefined {
    for (const kyc of this.liste_kyc) {
      if (this.history.isKYCEligible(kyc)) {
        this.current_kyc = kyc;
        return kyc;
      }
    }
    return undefined;
  }

  public getFirstKyc(): QuestionKYC {
    return this.liste_kyc[0];
  }

  public getKycCourante(): QuestionKYC {
    return this.current_kyc;
  }

  public getFirstKYCNonRepondue(): QuestionKYC | undefined {
    return this.liste_kyc.find((k) => !k.is_answered);
  }

  public getFirstKYCNonRepondueEligible(): QuestionKYC | undefined {
    return this.liste_kyc.find(
      (k) => !k.is_answered && this.history.isKYCEligible(k),
    );
  }
  public getFirstKYCEligible(): QuestionKYC | undefined {
    return this.liste_kyc.find((k) => this.history.isKYCEligible(k));
  }
  public getLastKYCEligible(): QuestionKYC | undefined {
    for (let index = this.liste_kyc.length - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (this.history.isKYCEligible(kyc)) {
        return kyc;
      }
    }
    return undefined;
  }

  public setNextKycEligible(current_kyc_code: string): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    for (let index = foundIndex + 1; index < this.liste_kyc.length; index++) {
      const current_kyc = this.liste_kyc[index];

      if (this.history.isKYCEligible(current_kyc)) {
        this.current_kyc = current_kyc;
        return current_kyc;
      }
    }
    this.current_kyc = undefined;
    return undefined;
  }

  public setNextKycEligibleNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    for (let index = foundIndex + 1; index < this.liste_kyc.length; index++) {
      const current_kyc = this.liste_kyc[index];

      if (this.history.isKYCEligible(current_kyc) && !current_kyc.is_answered) {
        this.current_kyc = current_kyc;
        return current_kyc;
      }
    }
    this.current_kyc = undefined;
    return undefined;
  }

  public setNextKyc(current_kyc_code: string): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    const result = this.liste_kyc[foundIndex + 1];
    this.current_kyc = result;
    return result;
  }

  public setNextKycNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === this.liste_kyc.length - 1 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    for (let index = foundIndex + 1; index < this.liste_kyc.length; index++) {
      const current_kyc = this.liste_kyc[index];

      if (!current_kyc.is_answered) {
        this.current_kyc = current_kyc;
        return current_kyc;
      }
    }
    this.current_kyc = undefined;
    return undefined;
  }

  public setPreviousKyc(current_kyc_code: string): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    const result = this.liste_kyc[foundIndex - 1];
    this.current_kyc = result;
    return result;
  }
  public setPreviousKycNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    for (let index = foundIndex - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (!kyc.is_answered) {
        this.current_kyc = kyc;
        return kyc;
      }
    }
    this.current_kyc = undefined;
    return undefined;
  }

  public setPreviousKycEligible(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    for (let index = foundIndex - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (this.history.isKYCEligible(kyc)) {
        this.current_kyc = kyc;
        return kyc;
      }
    }
    this.current_kyc = undefined;
    return undefined;
  }

  public setPreviousKycEligibleNonRepondu(
    current_kyc_code: string,
  ): QuestionKYC | undefined {
    const foundIndex = this.liste_kyc.findIndex(
      (k) => k.code === current_kyc_code,
    );
    if (foundIndex === 0 || foundIndex === -1) {
      this.current_kyc = undefined;
      return undefined;
    }
    for (let index = foundIndex - 1; index >= 0; index--) {
      const kyc = this.liste_kyc[index];
      if (this.history.isKYCEligible(kyc) && !kyc.is_answered) {
        this.current_kyc = kyc;
        return kyc;
      }
    }
    this.current_kyc = undefined;
    return undefined;
  }
}
