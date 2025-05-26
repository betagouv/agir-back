import { TagRepository } from '../../../infrastructure/repository/tag.repository';
import { ProfileRecommandationUtilisateur_v0 } from '../../object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import { ScoredContent } from '../scoredContent';
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

    // INIT
    content_list.forEach((c) => (c.score = 0));

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

    for (const content of result) {
      const matching_tags = this.getOccurenceTags(content);
      for (const tag of matching_tags) {
        content.score += 10;
        content.explicationScore.addInclusionTag(tag, 10);
      }

      if (content.isLocal()) {
        content.score += 10;
        content.explicationScore.setLocal(10);
      }

      for (const thematique of content.getThematiques()) {
        const tag_thematique = Tag_v2[`appetence_thematique_${thematique}`];
        if (this.set_tags_actifs.has(tag_thematique)) {
          content.score += 10;
          content.explicationScore.addInclusionTag(tag_thematique, 10);
        }
      }

      for (const tag of content.getInclusionTags()) {
        const tag_def = TagRepository.getTagDefinition(tag);
        if (tag_def) {
          if (tag_def.boost) {
            content.score += tag_def.boost;
            content.explicationScore.setBoost(tag, tag_def.boost);
          }
        }
      }

      content.score += this.hash(content.getDistinctText());
    }

    result.sort((a, b) => b.score - a.score);

    return result;
  }

  public getListeTagsActifs(): Tag_v2[] {
    return Array.from(this.set_tags_actifs.values());
  }
  public addListeTagActifs(liste: string[]) {
    for (const tag of liste) {
      if (Tag_v2[tag]) this.set_tags_actifs.add(Tag_v2[tag]);
    }
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

  private getOccurenceTags(c: TaggedContent): string[] {
    const liste_tags = c.getInclusionTags();

    return liste_tags.filter((t) => this.set_tags_actifs.has(Tag_v2[t]));
  }

  public static sortScoredContent(content_liste: ScoredContent[]) {
    content_liste.sort((a, b) => b.score - a.score);
  }

  private hash(s: string): number {
    for (var i = 0, h = 0xdeadbeef; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    const hash = (h ^ (h >>> 16)) >>> 0;
    return hash / 100000000000;
  }
}
