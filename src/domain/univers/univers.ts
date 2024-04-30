import { UniversType } from './universType';

export class Univers {
  titre: string;
  type: UniversType;
  etoiles: number;
  is_locked: boolean;
  reason_locked: string;
  image_url: string;

  constructor(data: Univers) {
    Object.assign(this, data);
  }
}