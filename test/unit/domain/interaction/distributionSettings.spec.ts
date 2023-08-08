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
  it('insertPinnedInteractions : add one in empty list', () => {
    // GIVEN
    const target = [];
    const i = new Interaction({ pinned_at_position: 1 });

    // WHEN
    DistributionSettings.insertPinnedInteractions([i], target);

    // THEN
    expect(target).toHaveLength(1);
  });
  it('insertPinnedInteractions : add one in middle of list', () => {
    // GIVEN
    const i1 = new Interaction({ id: '1' });
    const i2 = new Interaction({ id: '2' });
    const i3 = new Interaction({ id: 'pin', pinned_at_position: 1 });
    const target = [i1, i2];

    // WHEN
    DistributionSettings.insertPinnedInteractions([i3], target);

    // THEN
    expect(target).toHaveLength(3);
    expect(target[0].id).toEqual('1');
    expect(target[1].id).toEqual('pin');
    expect(target[2].id).toEqual('2');
  });
  it('insertPinnedInteractions : add pinned in pin position when several, one in between', () => {
    // GIVEN
    const i1 = new Interaction({ id: '1' });
    const i2 = new Interaction({ id: '2' });
    const i3 = new Interaction({ id: 'pin1', pinned_at_position: 1 });
    const i4 = new Interaction({ id: 'pin3', pinned_at_position: 3 });
    const target = [i1, i2];

    // WHEN
    DistributionSettings.insertPinnedInteractions([i4, i3], target);

    // THEN
    expect(target).toHaveLength(4);
    expect(target[0].id).toEqual('1');
    expect(target[1].id).toEqual('pin1');
    expect(target[2].id).toEqual('2');
    expect(target[3].id).toEqual('pin3');
  });
  it('insertPinnedInteractions : add pinned in pin position when several, one after other pushing back remaining', () => {
    // GIVEN
    const i1 = new Interaction({ id: '1' });
    const i2 = new Interaction({ id: '2' });
    const i3 = new Interaction({ id: 'pin1', pinned_at_position: 1 });
    const i4 = new Interaction({ id: 'pin2', pinned_at_position: 2 });
    const target = [i1, i2];

    // WHEN
    DistributionSettings.insertPinnedInteractions([i4, i3], target);

    // THEN
    expect(target).toHaveLength(4);
    expect(target[0].id).toEqual('1');
    expect(target[1].id).toEqual('pin1');
    expect(target[2].id).toEqual('pin2');
    expect(target[3].id).toEqual('2');
  });
});
