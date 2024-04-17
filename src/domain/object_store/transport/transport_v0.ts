import { Versioned } from '../versioned';
import {
  Transport,
  TransportQuotidien,
} from '../../transport/transport';

export class Transport_v0 extends Versioned {
  transports_quotidiens: TransportQuotidien[];
  avions_par_an: number;

  static serialise(domain: Transport): Transport_v0 {
    return {
      version: 0,
      transports_quotidiens: domain.transports_quotidiens,
      avions_par_an: domain.avions_par_an,
    };
  }
}
