import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import {
  PonderationTagHelper,
  PonderationTagSet,
  Tag,
  TaggedAndScoredContent,
} from '../../../../src/domain/utilisateur/ponderationTags';

describe('Objet PonderationTagHelper', () => {
  it('addTagToSet : ajoute le bon tag', () => {
    // GIVEN
    const set: PonderationTagSet = {};

    // WHEN
    PonderationTagHelper.addTagToSet(set, Tag.utilise_moto_ou_voiture, 12);

    // THEN
    expect(set.utilise_moto_ou_voiture).toEqual(12);
    expect(set.interet_transports).toBeUndefined();
  });
  it('computeAndAffectScores : calcul le score total de chaque contenu', () => {
    // GIVEN
    const utilisateur = new Utilisateur();
    utilisateur.ponderation_tags = {
      utilise_moto_ou_voiture: 10,
      interet_transports: 20,
    };
    const content_list: TaggedAndScoredContent[] = [
      { score: 0, tags: [Tag.utilise_moto_ou_voiture] },
      { score: 0, tags: [Tag.interet_transports] },
      { score: 0, tags: [Tag.utilise_moto_ou_voiture, Tag.interet_transports] },
    ];

    // WHEN
    PonderationTagHelper.computeAndAffectScores(content_list, utilisateur);

    // THEN
    expect(content_list[0].score).toEqual(10);
    expect(content_list[1].score).toEqual(20);
    expect(content_list[2].score).toEqual(30);
  });
  it('computeAndAffectScores : ok si collection utilisateur vide', () => {
    // GIVEN
    const utilisateur = new Utilisateur();
    utilisateur.ponderation_tags = {};
    const content_list: TaggedAndScoredContent[] = [
      { score: 0, tags: [Tag.utilise_moto_ou_voiture] },
      { score: 0, tags: [Tag.interet_transports] },
      { score: 0, tags: [Tag.utilise_moto_ou_voiture, Tag.interet_transports] },
    ];

    // WHEN
    PonderationTagHelper.computeAndAffectScores(content_list, utilisateur);

    // THEN
    expect(content_list[0].score).toEqual(0);
    expect(content_list[1].score).toEqual(0);
    expect(content_list[2].score).toEqual(0);
  });
  it('computeAndAffectScores : ok si contenu sans tags', () => {
    // GIVEN
    const utilisateur = new Utilisateur();
    utilisateur.ponderation_tags = {
      utilise_moto_ou_voiture: 10,
      interet_transports: 20,
    };
    const content_list: TaggedAndScoredContent[] = [
      { score: 0, tags: [Tag.utilise_moto_ou_voiture] },
      { score: 0, tags: [Tag.interet_transports] },
      { score: 0, tags: [] },
    ];

    // WHEN
    PonderationTagHelper.computeAndAffectScores(content_list, utilisateur);

    // THEN
    expect(content_list[0].score).toEqual(10);
    expect(content_list[1].score).toEqual(20);
    expect(content_list[2].score).toEqual(0);
  });
});
