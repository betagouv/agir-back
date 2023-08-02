import { SuiviType } from './suiviType';

export class Suivi {
  constructor(type: SuiviType, data, date?: Date) {
    this.type = type;
    this.date = date ? date : new Date();
    this.injectValuesFromObject(data);
  }

  private type: SuiviType;
  private date: Date;
  getType(): SuiviType {
    return this.type;
  }
  getDate(): Date {
    return this.date;
  }
  populateValuesFromData(data) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
  injectValuesFromObject(input: object) {
    this.populateValuesFromData(this.cloneAndClean(input));
  }
  calculImpacts() {
    throw new Error('calculImpacts() should be implemented in subclass');
  }
  getTotalImpact(): number {
    return this['total_impact'] ? this['total_impact'] : 0;
  }
  setTotalImpact(impact: number) {
    this['total_impact'] = impact;
  }
  mergeSuiviDataWith(suivi: Suivi): Suivi {
    let result = new Suivi(SuiviType.merge, {}, this.getDate());
    result.injectValuesFromObject(suivi);
    result.injectValuesFromObject(this);
    result['total_impact'] = this.getTotalImpact() + suivi.getTotalImpact();
    return result;
  }
  cloneAndClean(input?: object): object {
    let thisToClean = { ...(input ? input : this) };
    delete thisToClean['type'];
    delete thisToClean['date'];
    return thisToClean;
  }
}
