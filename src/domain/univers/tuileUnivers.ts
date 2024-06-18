export class TuileUnivers {
  id_cms: number;
  titre: string;
  type: string;
  etoiles: number;
  is_locked: boolean;
  reason_locked: string;
  image_url: string;
  is_done: boolean;

  constructor(data: TuileUnivers) {
    Object.assign(this, data);
  }
}
