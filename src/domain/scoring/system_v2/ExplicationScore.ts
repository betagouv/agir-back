import { Tag_v2 } from './Tag_v2';

export type Explication = {
  inclusion_tag?: string;
  exclusion_tag?: string;
  valeur?: number;
  est_local?: boolean;
  est_boost?: boolean;
};

export class ExplicationScore {
  liste_explications: Explication[];

  constructor() {
    this.liste_explications = [];
  }

  public addInclusionTag(tag: string, valeur: number) {
    this.liste_explications.push({
      inclusion_tag: tag,
      valeur: valeur,
    });
  }
  public addExclusionTag(tag: Tag_v2) {
    this.liste_explications.push({
      exclusion_tag: tag,
    });
  }
  public setLocal(valeur: number) {
    this.liste_explications.push({
      est_local: true,
      valeur: valeur,
    });
  }
  public setBoost(tag: string, valeur: number) {
    this.liste_explications.push({
      inclusion_tag: tag,
      est_boost: true,
      valeur: valeur,
    });
  }
}
