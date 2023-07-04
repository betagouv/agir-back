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
}
