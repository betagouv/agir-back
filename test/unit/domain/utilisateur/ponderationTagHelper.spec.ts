import {
  PonderationTagHelper,
  PonderationTagSet,
  Tag,
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
});
