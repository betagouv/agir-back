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
    let result = [];
    result = result.concat(this.alimentation);
    result = result.concat(this.transports);
    return result;
  }
}
