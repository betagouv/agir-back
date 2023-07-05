import { Suivi } from './suivi';

export class SuiviComplet {
  constructor() {
    this.suiviList = [];
  }

  private suiviList: Suivi[];

  isEmpty() {
    return this.suiviList.length === 0;
  }
  getNombreSuivi() {
    return this.suiviList.length;
  }
  addSuiviOfTypeIfNotAlreadyThereAndSameDay(suivi: Suivi) {
    if (this.suiviList.length === 0) {
      return this.suiviList.push(suivi);
    }
    const existing = this.suiviList.find(
      (a) => a.getType() === suivi.getType(),
    );
    if (
      !existing &&
      suivi.getDate().toDateString() ===
        this.suiviList[0].getDate().toDateString()
    ) {
      this.suiviList.push(suivi);
    }
  }

  isOfSameDay(suivi: Suivi): boolean {
    return (
      this.isEmpty() ||
      this.suiviList[0].getDate().toDateString() ===
        suivi.getDate().toDateString()
    );
  }

  getDate(): Date | undefined {
    if (this.suiviList.length === 0) return undefined;
    return this.suiviList[0].getDate();
  }

  mergeAllToSingleSuivi(): Suivi | undefined {
    if (this.isEmpty()) return undefined;
    let result = new Suivi(Suivi.merge, this.suiviList[0].getDate());
    this.suiviList.forEach((suivi) => {
      result = result.mergeSuiviDataWith(suivi);
    });
    return result;
  }

  static computeLastVariationOfList(list: SuiviComplet[]) {
    if (list.length === 0) return 0;
    if (list.length === 1)
      return list[0].mergeAllToSingleSuivi().getTotalImpact();
    return (
      list[list.length - 1].mergeAllToSingleSuivi().getTotalImpact() -
      list[list.length - 2].mergeAllToSingleSuivi().getTotalImpact()
    );
  }

  static computeMoyenne(list: SuiviComplet[]) {
    if (list.length === 0) return 0;
    let result = 0;
    list.forEach((suiviComplet) => {
      result += suiviComplet.computeTotalImpact();
    });
    return result / list.length;
  }
  computeTotalImpact() {
    if (this.suiviList.length === 0) return 0;

    let result = 0;
    this.suiviList.forEach((suivi) => {
      result += suivi.getTotalImpact();
    });
    return result;
  }
}
