import { TaggedContent } from '../../../../src/domain/scoring/taggedContent';
import { TagRubrique } from '../../../../src/domain/scoring/tagRubrique';
import {
  PonderationApplicativeManager,
  ApplicativePonderationSetName,
} from '../../../../src/domain/scoring/ponderationApplicative';
import { Tag } from '../../../../src/domain/scoring/tag';

describe('PonderationApplicativeManager', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
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
      getTags: () => [TagRubrique.R32, TagRubrique.R33, TagRubrique.R1],
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {});
    // THEN

    expect(content.score).toEqual(0);
  });
  it('increaseScoreContent : sum ok, noel ponderation', () => {
    // GIVEN
    process.env.PONDERATION_RUBRIQUES = 'noel';
    const content: TaggedContent = {
      score: 0,
      getTags: () => [TagRubrique.R32, TagRubrique.R33, TagRubrique.R1],
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {});
    // THEN

    expect(content.score).toEqual(20);
  });
  it('increaseScoreContent : sum ok, double la thematique transport', () => {
    // GIVEN
    process.env.PONDERATION_RUBRIQUES = 'exp';
    const content: TaggedContent = {
      score: 0,
      getTags: () => [Tag.transport],
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {
      transport: 50,
    });
    // THEN

    expect(content.score).toEqual(150);
  });
  it('increaseScoreContent : sum ok when negative values', () => {
    // GIVEN
    process.env.PONDERATION_RUBRIQUES = 'exp';
    const content: TaggedContent = {
      score: 0,
      getTags: () => [TagRubrique.R1, TagRubrique.R2],
    };

    // WHEN
    PonderationApplicativeManager.increaseScoreContent(content, {});
    // THEN

    expect(content.score).toEqual(-5);
  });
});
