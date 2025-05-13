import { ExplicationScore } from '../../../../src/domain/scoring/system_v2/ExplicationScore';
import { ProfileRecommandationUtilisateur } from '../../../../src/domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../../../src/domain/scoring/system_v2/Tag_v2';
import { TaggedContent } from '../../../../src/domain/scoring/taggedContent';

describe('ProfileRecommandationUtilisateur', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {});

  afterAll(async () => {
    process.env = OLD_ENV;
  });

  it('trierEtFiltrerRecommandations : inclus un contenu non taggué', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_une_voiture],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(content.score).toEqual(0);
    expect(result).toHaveLength(1);
    expect(result[0].score).toEqual(0);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [],
    });
  });
  it('trierEtFiltrerRecommandations : inclus un contenu taggué mais profile utilisateur vide', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_une_voiture],
      getExclusionTags: () => [],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(content.score).toEqual(0);
    expect(result).toHaveLength(1);
    expect(result[0].score).toEqual(0);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [],
    });
  });
  it('trierEtFiltrerRecommandations : inclus un contenu taggué en exclusion mais profile utilisateur vide', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [Tag_v2.a_une_voiture],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(content.score).toEqual(0);
    expect(result).toHaveLength(1);
    expect(result[0].score).toEqual(0);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [],
    });
  });
  it.only('trierEtFiltrerRecommandations : exclusion de contenu', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [Tag_v2.a_une_voiture],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_une_voiture],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(content.score).toEqual(0);
    expect(result).toHaveLength(0);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        {
          exclusion_tag: 'a_une_voiture',
        },
      ],
    });
  });
  it('trierEtFiltrerRecommandations : inclusion de contenu, augmentation de score', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_une_voiture],
      getExclusionTags: () => [],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_une_voiture],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(result).toHaveLength(1);
    expect(result[0].score).toEqual(10);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'a_une_voiture',
          valeur: 10,
        },
      ],
    });
  });
  it('trierEtFiltrerRecommandations : double match => score supérieur', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [
        Tag_v2.a_une_voiture,
        Tag_v2.est_locataire,
        Tag_v2.mange_de_la_viande,
      ],
      getExclusionTags: () => [],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_une_voiture, Tag_v2.est_locataire],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(result).toHaveLength(1);
    expect(result[0].score).toEqual(20);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'a_une_voiture',
          valeur: 10,
        },
        {
          inclusion_tag: 'est_locataire',
          valeur: 10,
        },
      ],
    });
  });
  it('trierEtFiltrerRecommandations : trie le contenu', () => {
    // GIVEN
    const content1: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      explicationScore: new ExplicationScore(),
    };

    const content2: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_une_voiture],
      getExclusionTags: () => [],
      explicationScore: new ExplicationScore(),
    };

    const content3: TaggedContent = {
      score: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [
        Tag_v2.prends_l_avion,
        Tag_v2.mange_de_la_viande,
      ],
      getExclusionTags: () => [],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [
        Tag_v2.a_une_voiture,
        Tag_v2.mange_de_la_viande,
        Tag_v2.prends_l_avion,
      ],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([
      content2,
      content1,
      content3,
    ]);
    // THEN

    expect(result).toHaveLength(3);
    expect(result[0].score).toEqual(20);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'a_une_voiture',
          valeur: 10,
        },
        {
          inclusion_tag: 'est_locataire',
          valeur: 10,
        },
      ],
    });
  });
});
