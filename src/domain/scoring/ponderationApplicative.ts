import { TagPonderationSet } from './tagPonderationSet';
import { TaggedContent } from './taggedContent';
import { TagApplicatif } from './tagApplicatif';
import { ScoredContent } from './scoredContent';

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

export class PonderationApplicativeManager {
  private static ponderation_catalogue: ApplicativePonderationCatalogue =
    CATALOGUE;

  public static setCatalogue(catalogue: ApplicativePonderationCatalogue) {
    PonderationApplicativeManager.ponderation_catalogue = catalogue;
  }
  public static resetCatalogue() {
    PonderationApplicativeManager.ponderation_catalogue = CATALOGUE;
  }
  public static increaseScoreContent(
    content: TaggedContent,
    user_ponderation: TagPonderationSet,
  ) {
    const app_ponderation =
      PonderationApplicativeManager.getPonderationApplicativeCourante();
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
    content.score +=
      score + PonderationApplicativeManager.hash(content.getDistinctText());
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
      PonderationApplicativeManager.increaseScoreContent(
        content,
        user_ponderation,
      );
    });
  }

  private static getPonderationApplicativeCourante(): ApplicativePonderationSet {
    const set_name =
      process.env.PONDERATION_RUBRIQUES || ApplicativePonderationSetName.neutre;
    return PonderationApplicativeManager.ponderation_catalogue[set_name];
  }
}
