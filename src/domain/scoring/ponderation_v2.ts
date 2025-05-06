import { App } from '../app';
import { ScoredContent } from './scoredContent';
import { TagApplicatif } from './tagApplicatif';
import { TagPonderationSet } from './tagPonderationSet';
import { TaggedContent } from './taggedContent';

export enum ApplicativePonderationSetName {
  neutre = 'neutre',
  noel = 'noel',
  exp = 'exp',
}

const CATALOGUE: ApplicativePonderationCatalogue = {
  noel: {
    R32: 10,
    R33: 10,
    R34: 10,
    R35: 10,
    R36: 10,
  },
  neutre: {},
  exp: { R1: -10, R2: 5, transport: 100 },
};

type ApplicativePonderationSet = { [key in TagApplicatif]?: number };

export type ApplicativePonderationCatalogue = {
  [key in ApplicativePonderationSetName]?: ApplicativePonderationSet;
};

export class Ponderation_v2 {
  private static ponderation_catalogue: ApplicativePonderationCatalogue =
    CATALOGUE;

  public static setCatalogue(catalogue: ApplicativePonderationCatalogue) {
    Ponderation_v2.ponderation_catalogue = catalogue;
  }
  public static resetCatalogue() {
    Ponderation_v2.ponderation_catalogue = CATALOGUE;
  }
  public static increaseScoreContent(
    content: TaggedContent,
    user_ponderation: TagPonderationSet,
  ) {
    const app_ponderation = Ponderation_v2.getPonderationApplicativeCourante();
    let score = 0;
    const tags = content.getTags();
    tags.forEach((tag) => {
      let tag_value = app_ponderation[tag];
      if (tag_value) {
        score += tag_value;
      }
      tag_value = user_ponderation[tag];
      if (tag_value) {
        score += tag_value;
      }
    });
    if (content.isLocal()) {
      score += 10;
    }
    content.score += score + Ponderation_v2.hash(content.getDistinctText());
  }

  public static sortContent(content_liste: ScoredContent[]) {
    content_liste.sort((a, b) => b.score - a.score);
  }

  public static hash(s: string): number {
    for (var i = 0, h = 0xdeadbeef; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    const hash = (h ^ (h >>> 16)) >>> 0;
    return hash / 100000000000;
  }

  public static increaseScoreContentOfList(
    content_liste: TaggedContent[],
    user_ponderation: TagPonderationSet,
  ) {
    content_liste.forEach((content) => {
      Ponderation_v2.increaseScoreContent(content, user_ponderation);
    });
  }

  private static getPonderationApplicativeCourante(): ApplicativePonderationSet {
    const set_name =
      App.getCurrentPonderationRubriqueSetName() ||
      ApplicativePonderationSetName.neutre;
    return Ponderation_v2.ponderation_catalogue[set_name];
  }
}
