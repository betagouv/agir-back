import { Transport_v0 } from '../object_store/transport/transport_v0';
import { Onboarding } from './onboarding/onboarding';

export enum TransportQuotidien {
  voiture = 'voiture',
  moto = 'moto',
  pied = 'pied',
  velo = 'velo',
  commun = 'commun',
}

export class Transport {
  transports_quotidiens: TransportQuotidien[];
  avions_par_an: number;

  constructor(data?: Transport_v0) {
    if (!data) return;
    this.transports_quotidiens = data.transports_quotidiens;
    this.avions_par_an = data.avions_par_an;
  }

  public static buildFromOnboarding(data: Onboarding): Transport {
    return new Transport({
      version: 0,
      transports_quotidiens: data.transports,
      avions_par_an: data.avion,
    });
  }
}
