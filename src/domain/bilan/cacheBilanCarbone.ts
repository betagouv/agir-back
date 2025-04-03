import { CacheBilanCarbone_v0 } from '../object_store/bilan/cacheBilanCarbone_v0';

export class CacheBilanCarbone {
  total_kg: number;
  transport_kg: number;
  alimentation_kg: number;
  logement_kg: number;
  consommation_kg: number;
  updated_at: Date;
  est_bilan_complet: boolean;

  constructor(data?: CacheBilanCarbone_v0) {
    if (data) {
      this.total_kg = data.total_kg;
      this.alimentation_kg = data.alimentation_kg;
      this.consommation_kg = data.consommation_kg;
      this.logement_kg = data.logement_kg;
      this.transport_kg = data.transport_kg;
      this.updated_at = data.updated_at;
      this.est_bilan_complet = !!data.est_bilan_complet;
    } else {
      this.est_bilan_complet = false;
    }
  }
}
