import { ProfileRecommandationUtilisateur_v0 } from '../../object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import { TaggedContent } from '../taggedContent';
import { Tag_v2 } from './Tag_v2';

export class ProfileRecommandationUtilisateur {
  private set_tags_actifs: Set<Tag_v2>;

  constructor(data?: ProfileRecommandationUtilisateur_v0) {
    if (data) {
      this.set_tags_actifs = new Set(data.liste_tags_actifs);
    } else {
      this.set_tags_actifs = new Set();
    }
  }

  public trierEtFiltrerRecommandations<T extends TaggedContent>(
    content_list: T[],
  ): T[] {
    const result: T[] = [];

    const CURRENT_TAGS = Array.from(this.set_tags_actifs.values());
    for (const content of content_list) {
      if (this.hasIntersect(content.getExclusionTags(), CURRENT_TAGS)) {
        const exlusion_tags = this.getIntersect(
          content.getExclusionTags(),
          CURRENT_TAGS,
        );
        for (const tag of exlusion_tags) {
          content.explicationScore.addExclusionTag(tag);
        }
      } else {
        result.push(content);
      }
    }

    result.forEach((c) => (c.score = 0)); // juste in case

    for (const content of result) {
      const match_tags = this.getOccurenceTags(content);
      for (const tag of match_tags) {
        content.score += 10;
        content.explicationScore.addInclusionTag(tag, 10);
      }

      if (content.isLocal()) {
        content.score += 10;
        content.explicationScore.setLocal();
      }
    }

    return result;
  }

  public getListeTagsActifs(): Tag_v2[] {
    return Array.from(this.set_tags_actifs.values());
  }

  public setTag(tag: Tag_v2) {
    this.set_tags_actifs.add(tag);
  }
  public removeTag(tag: Tag_v2) {
    this.set_tags_actifs.delete(tag);
  }

  private hasIntersect(array_1: any[], array_2: any[]): boolean {
    return array_1.some((v) => array_2.indexOf(v) !== -1);
  }
  private getIntersect(array_1: any[], array_2: any[]): any[] {
    return array_1.filter((v) => array_2.indexOf(v) !== -1);
  }

  private getOccurenceTags(c: TaggedContent): Tag_v2[] {
    const liste_tags = c.getInclusionTags();

    return liste_tags.filter((t) => this.set_tags_actifs.has(t));
  }
}
