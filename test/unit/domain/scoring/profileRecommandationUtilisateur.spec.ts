import { ExplicationScore } from '../../../../src/domain/scoring/system_v2/ExplicationScore';
import { ProfileRecommandationUtilisateur } from '../../../../src/domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../../../src/domain/scoring/system_v2/Tag_v2';
import { TaggedContent } from '../../../../src/domain/scoring/taggedContent';
import { Thematique } from '../../../../src/domain/thematique/thematique';
import { TagRepository } from '../../../../src/infrastructure/repository/tag.repository';

describe('ProfileRecommandationUtilisateur', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    TagRepository.resetCache();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
  });

  it('trierEtFiltrerRecommandations : inclus un contenu non taggué', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,
      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_une_voiture],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(content.score)).toEqual(0);
    expect(result).toHaveLength(1);
    expect(Math.round(result[0].score)).toEqual(0);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [],
    });
  });
  it('trierEtFiltrerRecommandations : inclus un contenu taggué mais profile utilisateur vide', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_une_voiture],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(content.score)).toEqual(0);
    expect(result).toHaveLength(1);
    expect(Math.round(result[0].score)).toEqual(0);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [],
    });
  });
  it('trierEtFiltrerRecommandations : inclus un contenu taggué en exclusion mais profile utilisateur vide', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [Tag_v2.a_une_voiture],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(content.score)).toEqual(0);
    expect(result).toHaveLength(1);
    expect(Math.round(result[0].score)).toEqual(0);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [],
    });
  });
  it('trierEtFiltrerRecommandations : exclusion de contenu', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [Tag_v2.a_une_voiture],
      getThematiques: () => [Thematique.alimentation],
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
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_une_voiture],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
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
    expect(Math.round(result[0].score)).toEqual(10);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'a_une_voiture',
          valeur: 10,
          ponderation: 1,
        },
      ],
    });
  });

  it('trierEtFiltrerRecommandations : inclusion de thematique, augmentation de score', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.appetence_thematique_alimentation],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(result).toHaveLength(1);
    expect(Math.round(result[0].score)).toEqual(10);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'appetence_thematique_alimentation',
          valeur: 10,
          ponderation: 1,
        },
      ],
    });
  });

  it('trierEtFiltrerRecommandations : double match => score supérieur', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [
        Tag_v2.a_une_voiture,
        Tag_v2.est_locataire,
        Tag_v2.mange_de_la_viande,
      ],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
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
    expect(Math.round(result[0].score)).toEqual(20);
    expect(Math.round(result[0].pourcent_match)).toEqual(67);
    expect(result[0].explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'a_une_voiture',
          valeur: 10,
          ponderation: 1,
        },
        {
          inclusion_tag: 'est_locataire',
          valeur: 10,
          ponderation: 1,
        },
      ],
    });
  });
  it('trierEtFiltrerRecommandations : local = +10 pts', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => true,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(result).toHaveLength(1);
    expect(Math.round(result[0].score)).toEqual(10);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        {
          est_local: true,
          valeur: 10,
          inclusion_tag: Tag_v2.est_un_contenu_local,
          ponderation: 1,
        },
      ],
    });
  });
  it(`trierEtFiltrerRecommandations : le local se somme avec le reste`, () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => true,
      getInclusionTags: () => [Tag_v2.a_un_jardin],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_un_jardin],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(result[0].score)).toEqual(20);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        { inclusion_tag: 'a_un_jardin', valeur: 10, ponderation: 1 },
        {
          est_local: true,
          valeur: 10,
          inclusion_tag: Tag_v2.est_un_contenu_local,
          ponderation: 1,
        },
      ],
    });
  });

  it(`trierEtFiltrerRecommandations : appentence XXX s'applique de manière implicite sur les tematiques`, () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.appetence_thematique_alimentation],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(result[0].score)).toEqual(10);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'appetence_thematique_alimentation',
          valeur: 10,
          ponderation: 1,
        },
      ],
    });
  });
  it(`trierEtFiltrerRecommandations : boost via referentiel de tags`, () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_un_jardin],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    TagRepository.resetCache();
    TagRepository.addToCache({
      cms_id: '123',
      boost: 30,
      description: 'yo',
      label_explication: 'expli',
      ponderation: undefined,
      tag: Tag_v2.a_un_jardin,
    });

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(result[0].score)).toEqual(30);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        { est_boost: true, inclusion_tag: 'a_un_jardin', valeur: 30 },
      ],
    });
  });
  it(`trierEtFiltrerRecommandations : boost s'ajoute au match`, () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_un_jardin],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    TagRepository.resetCache();
    TagRepository.addToCache({
      cms_id: '123',
      boost: 30,
      description: 'yo',
      label_explication: 'expli',
      ponderation: undefined,
      tag: Tag_v2.a_un_jardin,
    });

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_un_jardin],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(result[0].score)).toEqual(40);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        { inclusion_tag: 'a_un_jardin', valeur: 10, ponderation: 1 },
        { inclusion_tag: 'a_un_jardin', est_boost: true, valeur: 30 },
      ],
    });
  });
  it(`trierEtFiltrerRecommandations : ponderation via referentiel de tags`, () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_un_jardin],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    TagRepository.resetCache();
    TagRepository.addToCache({
      cms_id: '123',
      boost: undefined,
      description: 'yo',
      label_explication: 'expli',
      ponderation: 5,
      tag: Tag_v2.a_un_jardin,
    });

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.a_un_jardin],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);

    // THEN
    expect(Math.round(result[0].score)).toEqual(50);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        { inclusion_tag: 'a_un_jardin', ponderation: 5, valeur: 50 },
      ],
    });
  });
  it('trierEtFiltrerRecommandations : trie le contenu', () => {
    // GIVEN
    const content1: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'A',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const content2: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'B',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.a_une_voiture],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const content3: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'C',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.prend_l_avion, Tag_v2.mange_de_la_viande],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [
        Tag_v2.a_une_voiture,
        Tag_v2.mange_de_la_viande,
        Tag_v2.prend_l_avion,
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
    expect(Math.round(result[0].score)).toEqual(10);
    expect(result[0].getDistinctText()).toEqual('B');
    expect(Math.round(result[1].score)).toEqual(20);
    expect(result[1].getDistinctText()).toEqual('C');
    expect(Math.round(result[2].score)).toEqual(0);
    expect(result[2].getDistinctText()).toEqual('A');
  });

  it(`trierEtFiltrerRecommandations : explications uniques`, () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,

      getTags: () => [],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [Tag_v2.appetence_thematique_alimentation],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    const profile = new ProfileRecommandationUtilisateur({
      liste_tags_actifs: [Tag_v2.appetence_thematique_alimentation],
      version: 0,
    });

    // WHEN
    const result = profile.trierEtFiltrerRecommandations([content]);
    // THEN

    expect(Math.round(result[0].score)).toEqual(10);
    expect(content.explicationScore).toEqual({
      liste_explications: [
        {
          inclusion_tag: 'appetence_thematique_alimentation',
          valeur: 10,
          ponderation: 1,
        },
      ],
    });
  });
  it(`ExplicationScore.listeUniqueExplications : explications uniques`, () => {
    // GIVEN
    const expli = new ExplicationScore();
    expli.addInclusionTag('AA', 1);
    expli.addInclusionTag('BB', 1);
    expli.addInclusionTag('AA', 1);

    // WHEN
    const result = expli.listeUniqueExplications();

    // THEN

    expect(result).toHaveLength(2);
    expect(result[0].inclusion_tag).toEqual('AA');
    expect(result[1].inclusion_tag).toEqual('BB');
  });
});
