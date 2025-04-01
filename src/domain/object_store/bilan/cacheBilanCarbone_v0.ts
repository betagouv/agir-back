import { CacheBilanCarbone } from '../../bilan/cacheBilanCarbone';
import { Versioned_v0 } from '../versioned';

export class CacheBilanCarbone_v0 extends Versioned_v0 {
  total_kg: number;
  transport_kg: number;
  alimentation_kg: number;
  logement_kg: number;
  consommation_kg: number;
  updated_at: Date;

  static serialise(domain: CacheBilanCarbone): CacheBilanCarbone_v0 {
    return {
      version: 0,
      total_kg: domain.total_kg,
      transport_kg: domain.transport_kg,
      alimentation_kg: domain.alimentation_kg,
      logement_kg: domain.logement_kg,
      consommation_kg: domain.consommation_kg,
      updated_at: domain.updated_at,
    };
  }
}
