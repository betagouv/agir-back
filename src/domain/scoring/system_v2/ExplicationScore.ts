import { Tag_v2 } from './Tag_v2';

export type Explication = {
  inclusion_tag?: Tag_v2;
  exclusion_tag?: Tag_v2;
  valeur?: number;
  est_local?: boolean;
};

export class ExplicationScore {
  liste_explications: Explication[];

  constructor() {
    this.liste_explications = [];
  }

  public addInclusionTag(tag: Tag_v2, valeur: number) {
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
  public setLocal() {
    this.liste_explications.push({
      est_local: true,
    });
  }
}
