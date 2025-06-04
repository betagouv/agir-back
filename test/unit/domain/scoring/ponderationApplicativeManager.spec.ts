import {
  ApplicativePonderationSetName,
  PonderationApplicativeManager,
} from '../../../../src/domain/scoring/ponderationApplicative';
import { ExplicationScore } from '../../../../src/domain/scoring/system_v2/ExplicationScore';
import { Tag } from '../../../../src/domain/scoring/tag';
import { TaggedContent } from '../../../../src/domain/scoring/taggedContent';
import { TagRubrique } from '../../../../src/domain/scoring/tagRubrique';
import { Thematique } from '../../../../src/domain/thematique/thematique';

describe('PonderationApplicativeManager', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
  });

  afterAll(async () => {
    process.env = OLD_ENV;
  });

  it('increaseScoreContent : sum ok', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,
      getTags: () => [TagRubrique.R32, TagRubrique.R33, TagRubrique.R1],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {});
    // THEN

    expect(Math.round(content.score)).toEqual(0);
  });
  it('increaseScoreContent : ajout 10 pour contenu local', () => {
    // GIVEN
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,
      getTags: () => [TagRubrique.R32, TagRubrique.R33, TagRubrique.R1],
      getDistinctText: () => 'abc',
      isLocal: () => true,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {});
    // THEN

    expect(Math.round(content.score)).toEqual(10);
  });
  it('increaseScoreContent : sum ok, noel ponderation', () => {
    // GIVEN
    process.env.PONDERATION_RUBRIQUES = 'noel';
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,
      getTags: () => [TagRubrique.R32, TagRubrique.R33, TagRubrique.R1],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {});
    // THEN

    expect(Math.round(content.score)).toEqual(20);
  });
  it('increaseScoreContent : sum ok, double la thematique transport', () => {
    // GIVEN
    process.env.PONDERATION_RUBRIQUES = 'exp';
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,
      getTags: () => [Tag.transport],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {
      transport: 50,
    });
    // THEN

    expect(Math.round(content.score)).toEqual(150);
  });
  it('increaseScoreContent : sum ok when negative values', () => {
    // GIVEN
    process.env.PONDERATION_RUBRIQUES = 'exp';
    const content: TaggedContent = {
      score: 0,
      pourcent_match: 0,
      getTags: () => [TagRubrique.R1, TagRubrique.R2],
      getDistinctText: () => 'abc',
      isLocal: () => false,
      getInclusionTags: () => [],
      getExclusionTags: () => [],
      getThematiques: () => [Thematique.alimentation],
      explicationScore: new ExplicationScore(),
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {});
    // THEN

    expect(Math.round(content.score)).toEqual(-5);
  });

  it('hash : nombre entre 0 et 1 pour hash', () => {
    // WHEN
    const result = PonderationApplicativeManager.hash('12345');

    // THEN
    expect(result).toEqual(0.02976823792);
  });
  it('hash : nombre entre 0 et 1 pour hash #2', () => {
    // WHEN
    const result = PonderationApplicativeManager.hash('fjmlf fsqfuqsfj');

    // THEN
    expect(result).toEqual(0.02086622578);
  });
});
