import { Transport_v0 } from '../object_store/transport/transport_v0';

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

  patch?(input: Transport) {
    this.transports_quotidiens = this.AorB(
      input.transports_quotidiens,
      this.transports_quotidiens,
    );
    this.avions_par_an = this.AorB(input.avions_par_an, this.avions_par_an);
  }

  private AorB?<T>(a: T, b: T): T {
    if (a === undefined) return b;
    return a;
  }
}
