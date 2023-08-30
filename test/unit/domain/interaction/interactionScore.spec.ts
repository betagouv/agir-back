import { Decimal } from '@prisma/client/runtime/library';
import { InteractionScore } from '../../../../src/domain/interaction/interactionScore';

describe('InteractionScore', () => {
  it('upScore : increase properly score', () => {
    // GIVEN
    const interaction = new InteractionScore('1', new Decimal('0.2'));

    // WHEN
    interaction.upScore(new Decimal(4));

    // THEN
    expect(interaction.score).toEqual(new Decimal(0.8));
  });
  it('downScore : decrease properly score', () => {
    // GIVEN
    const interaction = new InteractionScore('1', new Decimal('0.8'));

    // WHEN
    interaction.downScore(new Decimal(8));

    // THEN
    expect(interaction.score).toEqual(new Decimal(0.1));
  });
});
