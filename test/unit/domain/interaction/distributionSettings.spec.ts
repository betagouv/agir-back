import { InteractionDistribution } from '../../../../src/domain/interaction/interactionDistribution';
import { Interaction } from '../../../../src/domain/interaction/interaction';
import { InteractionType } from '../../../../src/domain/interaction/interactionType';
import { InteractionPlacement } from '../../../../src/domain/interaction/interactionPosition';
import { DistributionSettings } from '../../../../src/domain/interaction/distributionSettings';

describe('DistributionSettings', () => {
  it('addInteractionsToList : should return target list when empty source list', () => {
    // GIVEN
    const i1 = new Interaction({ id: '1', type: InteractionType.aide });
    const i2 = new Interaction({ id: '2', type: InteractionType.article });
    const i3 = new Interaction({ id: '3', type: InteractionType.quizz });

    // WHEN
    const result = DistributionSettings.addInteractionsToList([], [i1, i2, i3]);

    // THEN
    expect(result).toStrictEqual([i1, i2, i3]);
  });
  it('addInteractionsToList : adds when not prefered reached', () => {
    // GIVEN
    const i1 = new Interaction({ id: '1', type: InteractionType.aide });
    const i2 = new Interaction({ id: '2', type: InteractionType.aide });

    DistributionSettings.overrideSettings(
      new Map([
        [
          InteractionType.aide,
          new InteractionDistribution(2, InteractionPlacement.any),
        ],
      ]),
    );
    // WHEN
    const result = DistributionSettings.addInteractionsToList([i1], [i2]);

    // THEN
    expect(result).toHaveLength(2);
  });
  it('addInteractionsToList : does not add when prefered reached', () => {
    // GIVEN
    const i1 = new Interaction({ id: '1', type: InteractionType.aide });
    const i2 = new Interaction({ id: '2', type: InteractionType.aide });

    DistributionSettings.overrideSettings(
      new Map([
        [
          InteractionType.aide,
          new InteractionDistribution(1, InteractionPlacement.any),
        ],
      ]),
    );
    // WHEN
    const result = DistributionSettings.addInteractionsToList([i1], [i2]);

    // THEN
    expect(result).toHaveLength(1);
  });
  it('addInteractionsToList : adds when no settings for given type', () => {
    // GIVEN
    const i1 = new Interaction({ id: '1', type: InteractionType.aide });
    const i2 = new Interaction({ id: '2', type: InteractionType.aide });
    const i3 = new Interaction({ id: '3', type: InteractionType.aide });
    const i4 = new Interaction({ id: '4', type: InteractionType.aide });

    DistributionSettings.overrideSettings(new Map([]));
    // WHEN
    const result = DistributionSettings.addInteractionsToList(
      [i1, i2, i3],
      [i4],
    );

    // THEN
    expect(result).toHaveLength(4);
  });
});
