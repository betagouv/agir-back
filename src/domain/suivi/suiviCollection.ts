import { Suivi } from './suivi';
import { SuiviAlimentation } from './suiviAlimentation';
import { SuiviTransport } from './suiviTransport';

export class SuiviCollection {
  constructor() {
    this.alimentation = [];
    this.transports = [];
  }

  alimentation: SuiviAlimentation[];
  transports: SuiviTransport[];

  mergeAll(): Suivi[] {
    let result: Suivi[] = [];
    result = result.concat(this.alimentation);
    result = result.concat(this.transports);
    return result;
  }
  mergeAllAndOrderByDate(): Suivi[] {
    let result = this.mergeAll();
    result.sort((a, b) => {
      return a.getDate().getTime() - b.getDate().getTime();
    });
    return result;
  }
  getLastSuiviDate(): Date | undefined {
    const orderedSuivi = this.mergeAllAndOrderByDate();
    return orderedSuivi.length === 0 ? undefined : orderedSuivi.pop().getDate();
  }
  getLastSuivi(): Suivi | undefined {
    return this.mergeAllAndOrderByDate().pop();
  }
  getLastDayMergedSuivi(startIndex?: number): Suivi | undefined {
    let list = this.mergeAllAndOrderByDate();
    if (list.length === 0) return undefined;
    if (list.length === 1) return list[0];
    let index = startIndex | list.length - 1;
    const currentDateString = list[index].getDate().toDateString();
    let result = list[index];
    index--;
    while (
      index >= 0 &&
      list[index].getDate().toDateString() === currentDateString
    ) {
      result = result.mergeSuiviDataWith(list[index]);
      index--;
    }

    return result;
  }
}
