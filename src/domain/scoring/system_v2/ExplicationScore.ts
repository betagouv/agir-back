import { Tag_v2 } from './Tag_v2';

export type Explication = {
  inclusion_tag?: string;
  exclusion_tag?: string;
  valeur?: number;
  ponderation?: number;
  est_local?: boolean;
  est_boost?: boolean;
};

export class ExplicationScore {
  private liste_explications: Explication[];

  constructor() {
    this.liste_explications = [];
  }

  public listeUniqueExplications(): Explication[] {
    const map = new Map<string, Explication>();
    for (const explication of this.liste_explications) {
      map.set(
        explication.exclusion_tag || explication.inclusion_tag,
        explication,
      );
    }
    return Array.from(map.values());
  }
  public addInclusionTag(tag: string, valeur: number, ponderation?: number) {
    this.liste_explications.push({
      inclusion_tag: tag,
      valeur: valeur,
      ponderation: ponderation ? ponderation : 1,
    });
  }
  public doesAlreadyContainInclusionTag(tag: string) {
    const foundIndex = this.liste_explications.findIndex(
      (a) => a.inclusion_tag === tag,
    );
    return foundIndex > -1;
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
      inclusion_tag: Tag_v2.est_un_contenu_local,
      ponderation: 1,
    });
  }
  public setBoost(tag: string, valeur: number) {
    this.liste_explications.push({
      inclusion_tag: tag,
      est_boost: true,
      valeur: valeur,
    });
  }
  public doesContainAnyExclusion(): boolean {
    return this.liste_explications.findIndex((e) => !!e.exclusion_tag) > -1;
  }
  public doesContainExclusionTag(tag: Tag_v2): boolean {
    return (
      this.liste_explications.findIndex((e) => e.exclusion_tag === tag) > -1
    );
  }
  public doesContainAnyInclusion(): boolean {
    return this.liste_explications.findIndex((e) => !!e.inclusion_tag) > -1;
  }
  public doesNotContainAnyInclusion(): boolean {
    return this.liste_explications.findIndex((e) => !!e.inclusion_tag) === -1;
  }
}
