import { Univers } from './univers';

export class TuileUnivers {
  titre: string;
  type: Univers;
  etoiles: number;
  is_locked: boolean;
  reason_locked: string;
  image_url: string;

  constructor(data: TuileUnivers) {
    Object.assign(this, data);
  }
}
