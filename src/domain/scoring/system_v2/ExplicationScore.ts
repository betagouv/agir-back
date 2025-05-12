import { Tag_v2 } from './Tag_v2';

export type Explication = {
  tag?: Tag_v2;
  valeur?: number;
  est_exclu?: boolean;
  est_local?: boolean;
};

export class ExplicationScore {
  liste_explications: Explication[];

  constructor() {
    this.liste_explications = [];
  }

  public addTag(tag: Tag_v2, valeur: number) {
    this.liste_explications.push({
      tag: tag,
      valeur: valeur,
    });
  }
  public setLocal() {
    this.liste_explications.push({
      est_local: true,
    });
  }
}
