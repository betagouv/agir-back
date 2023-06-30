import { response } from 'express';
import { Suivi } from './suivi';
import { SuiviRepas } from './suiviRepas';
import { SuiviTransport } from './suiviTransport';

export class SuiviCollection {
  constructor() {
    this.repas = [];
    this.transports = [];
  }

  repas: SuiviRepas[];
  transports: SuiviTransport[];

  mergeAll(): Suivi[] {
    let result = [];
    result = result.concat(this.repas);
    result = result.concat(this.transports);
    return result;
  }
}
