import { Utilisateur } from '../utilisateur';

export enum Tag {
  utilise_moto_ou_voiture = 'utilise_moto_ou_voiture',
  interet_transports = 'interet_transports',
}

export type PonderationTagSet = { [key in Tag]?: number };

export type TaggedAndScoredContent = {
  tags: Tag[];
  score: number;
};

export class PonderationTagHelper {
  static addTagToSet(set: PonderationTagSet, tag: Tag, value: number) {
    set[tag] = value;
  }

  public static computeAndAffectScores<T extends TaggedAndScoredContent>(
    content_liste: T[],
    utilisateur: Utilisateur,
  ) {
    content_liste.forEach((content) => {
      content.score = 0;
      content.tags.forEach((tag) => {
        const tag_value = utilisateur.ponderation_tags[tag];
        content.score += tag_value ? tag_value : 0;
      });
    });
  }
}
