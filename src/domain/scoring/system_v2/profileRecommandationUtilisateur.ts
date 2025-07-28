import { TagRepository } from '../../../infrastructure/repository/tag.repository';
import { ProfileRecommandationUtilisateur_v0 } from '../../object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import { ScoredContent } from '../scoredContent';
import { TaggedContent } from '../taggedContent';
import { Tag_v2 } from './Tag_v2';

const BASE_TAG_VALUE = 10;

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
    content_list.forEach((c) => ((c.score = 0), (c.pourcent_match = 0)));

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
        this.valoriseTag(tag, content);
      }

      if (this.isImportant(content)) {
        this.valoriseTag(Tag_v2.contenu_important, content);
      }
      if (this.isRecoWinter(content)) {
        this.valoriseTag(Tag_v2.recommandation_winter, content);
      }

      for (const tag of matching_tags) {
        this.valoriseTag(tag, content);
      }

      if (content.isLocal()) {
        this.valoriseLocal(content);
      }

      for (const thematique of content.getThematiques()) {
        const tag_thematique = Tag_v2[`appetence_thematique_${thematique}`];
        if (this.set_tags_actifs.has(tag_thematique)) {
          this.valoriseTag(tag_thematique, content);
        }
      }

      for (const tag of content.getInclusionTags()) {
        this.valoriseBoost(tag, content);
      }

      let total_ponderation = 0;
      for (const tag of content.getInclusionTags()) {
        const tag_def = TagRepository.getTagDefinition(tag);
        total_ponderation += tag_def?.ponderation ? tag_def.ponderation : 1;
      }
      if (total_ponderation !== 0) {
        content.pourcent_match =
          (content.score / (BASE_TAG_VALUE * total_ponderation)) * 100;
      } else {
        content.pourcent_match = 0;
      }

      content.pourcent_match += this.hash(content.getDistinctText());
    }

    const filtered_result = [];
    for (const content of result) {
      if (
        content.explicationScore.doesNotContainAnyInclusion() &&
        content.getExclusionTags().includes(Tag_v2.match_aucun_autre_tag)
      ) {
        content.explicationScore.addExclusionTag(Tag_v2.match_aucun_autre_tag);
      } else {
        filtered_result.push(content);
      }
    }

    filtered_result.sort((a, b) => b.pourcent_match - a.pourcent_match);

    return filtered_result;
  }

  public getListeTagsActifs(): Tag_v2[] {
    return Array.from(this.set_tags_actifs.values());
  }
  public addListeTagActifs(liste: string[]) {
    for (const tag of liste) {
      if (Tag_v2[tag]) this.set_tags_actifs.add(Tag_v2[tag]);
    }
  }
  public replaceAllTags(new_set: Set<Tag_v2>) {
    this.set_tags_actifs = new_set;
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

  private valoriseTag(tag: string, content: TaggedContent) {
    if (content.explicationScore.doesAlreadyContainInclusionTag(tag)) {
      return;
    }

    const tag_def = TagRepository.getTagDefinition(tag);
    let ponderation = 1;
    if (tag_def && tag_def.ponderation) {
      ponderation = tag_def.ponderation;
    }
    const increase = BASE_TAG_VALUE * ponderation;
    content.score += increase;
    content.explicationScore.addInclusionTag(tag, increase, ponderation);
  }
  private valoriseLocal(content: TaggedContent) {
    if (
      content.explicationScore.doesAlreadyContainInclusionTag(
        Tag_v2.est_un_contenu_local,
      )
    ) {
      return;
    }
    content.score += BASE_TAG_VALUE;
    content.explicationScore.setLocal(BASE_TAG_VALUE);
  }

  private valoriseBoost(tag: string, content: TaggedContent) {
    const tag_def = TagRepository.getTagDefinition(tag);
    if (tag_def && tag_def.boost) {
      content.score += tag_def.boost;
      content.explicationScore.setBoost(tag, tag_def.boost);
    }
  }

  private isImportant(content: TaggedContent): boolean {
    return content.getInclusionTags().includes(Tag_v2.contenu_important);
  }
  private isRecoWinter(content: TaggedContent): boolean {
    return content.getInclusionTags().includes(Tag_v2.recommandation_winter);
  }
}
