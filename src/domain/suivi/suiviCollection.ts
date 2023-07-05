import { Suivi } from './suivi';
import { SuiviAlimentation } from './suiviAlimentation';
import { SuiviComplet } from './suiviComplet';
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
  getOrderedSuiviCompletList(): SuiviComplet[] {
    let result: SuiviComplet[] = [];

    let listSuivi = this.mergeAllAndOrderByDate();
    if (listSuivi.length === 0) return result;

    let currentSuiviComplet = new SuiviComplet();

    listSuivi.reverse().forEach((suivi) => {
      if (currentSuiviComplet.isOfSameDay(suivi)) {
        currentSuiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(suivi);
      } else {
        result.push(currentSuiviComplet);
        currentSuiviComplet = new SuiviComplet();
        currentSuiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(suivi);
      }
    });
    result.push(currentSuiviComplet);
    return result.reverse();
  }
}
