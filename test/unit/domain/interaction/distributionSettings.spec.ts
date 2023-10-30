import { InteractionDistribution } from '../../../../src/domain/interaction/interactionDistribution';
import { Interaction } from '../../../../src/domain/interaction/interaction';
import { InteractionType } from '../../../../src/domain/interaction/interactionType';
import { InteractionPlacement } from '../../../../src/domain/interaction/interactionPosition';
import { DistributionSettings } from '../../../../src/domain/interaction/distributionSettings';
import { TestUtil } from '../../../../test/TestUtil';

describe('DistributionSettings', () => {
  it('addInteractionsToList : should return target list when empty source list', () => {
    // GIVEN
    const i1 = new Interaction(
      new Interaction(
        TestUtil.interactionData({ id: '1', type: InteractionType.aide }),
      ),
    );
    const i2 = new Interaction(
      new Interaction(
        TestUtil.interactionData({
          id: '2',
          type: InteractionType.article,
        }),
      ),
    );
    const i3 = new Interaction(
      new Interaction(
        TestUtil.interactionData({
          id: '3',
          type: InteractionType.quizz,
        }),
      ),
    );

    const work_list = [i1, i2, i3];

    // WHEN
    DistributionSettings.addInteractionsToList([], [i1, i2, i3]);

    // THEN
    expect(work_list).toStrictEqual([i1, i2, i3]);
  });
  it('addInteractionsToList : adds when not prefered reached', () => {
    // GIVEN
    const i1 = new Interaction(
      TestUtil.interactionData({
        id: '1',
        type: InteractionType.aide,
      }),
    );
    const i2 = new Interaction(
      TestUtil.interactionData({
        id: '2',
        type: InteractionType.aide,
      }),
    );

    DistributionSettings.overrideSettings(
      new Map([
        [
          InteractionType.aide,
          new InteractionDistribution(2, InteractionPlacement.any),
        ],
      ]),
    );
    const work_list = [i2];
    // WHEN
    DistributionSettings.addInteractionsToList([i1], work_list);

    // THEN
    expect(work_list).toHaveLength(2);
  });
  it('addInteractionsToList : does not add when prefered reached', () => {
    // GIVEN
    const i1 = new Interaction(
      TestUtil.interactionData({
        id: '1',
        type: InteractionType.aide,
      }),
    );
    const i2 = new Interaction(
      TestUtil.interactionData({
        id: '2',
        type: InteractionType.aide,
      }),
    );

    DistributionSettings.overrideSettings(
      new Map([
        [
          InteractionType.aide,
          new InteractionDistribution(1, InteractionPlacement.any),
        ],
      ]),
    );
    const work_list = [i2];
    // WHEN
    DistributionSettings.addInteractionsToList([i1], work_list);

    // THEN
    expect(work_list).toHaveLength(1);
  });
  it('addInteractionsToList : adds when no settings for given type', () => {
    // GIVEN
    const i1 = new Interaction(
      TestUtil.interactionData({
        id: '1',
        type: InteractionType.aide,
      }),
    );
    const i2 = new Interaction(
      TestUtil.interactionData({
        id: '2',
        type: InteractionType.aide,
      }),
    );
    const i3 = new Interaction(
      TestUtil.interactionData({
        id: '3',
        type: InteractionType.aide,
      }),
    );
    const i4 = new Interaction(
      TestUtil.interactionData({
        id: '4',
        type: InteractionType.aide,
      }),
    );

    DistributionSettings.overrideSettings(new Map([]));
    const work_list = [i4];
    // WHEN
    DistributionSettings.addInteractionsToList([i1, i2, i3], work_list);

    // THEN
    expect(work_list).toHaveLength(4);
  });
  it('insertPinnedInteractions : add one in empty list', () => {
    // GIVEN
    const target = [];
    const i = new Interaction(
      TestUtil.interactionData({ pinned_at_position: 1 }),
    );

    // WHEN
    DistributionSettings.insertPinnedInteractions([i], target);

    // THEN
    expect(target).toHaveLength(1);
  });
  it('insertPinnedInteractions : add one in middle of list', () => {
    // GIVEN
    const i1 = new Interaction(TestUtil.interactionData({ id: '1' }));
    const i2 = new Interaction(TestUtil.interactionData({ id: '2' }));
    const i3 = new Interaction(
      TestUtil.interactionData({ id: 'pin', pinned_at_position: 1 }),
    );
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
    const i1 = new Interaction(TestUtil.interactionData({ id: '1' }));
    const i2 = new Interaction(TestUtil.interactionData({ id: '2' }));
    const i3 = new Interaction(
      TestUtil.interactionData({ id: 'pin1', pinned_at_position: 1 }),
    );
    const i4 = new Interaction(
      TestUtil.interactionData({ id: 'pin3', pinned_at_position: 3 }),
    );
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
    const i1 = new Interaction(TestUtil.interactionData({ id: '1' }));
    const i2 = new Interaction(TestUtil.interactionData({ id: '2' }));
    const i3 = new Interaction(
      TestUtil.interactionData({ id: 'pin1', pinned_at_position: 1 }),
    );
    const i4 = new Interaction(
      TestUtil.interactionData({ id: 'pin2', pinned_at_position: 2 }),
    );
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
  it('countLockedInteractions : Count 2 locked inteeractitons', () => {
    // GIVEN
    const i1 = new Interaction(TestUtil.interactionData({ locked: true }));
    const i2 = new Interaction(TestUtil.interactionData({ locked: true }));
    const i3 = new Interaction(TestUtil.interactionData({ locked: false }));
    const i4 = new Interaction(TestUtil.interactionData({}));
    const list = [i1, i2, i3, i4];

    // WHEN
    const result = DistributionSettings.countLockedInteractions(list);

    // THEN
    expect(result).toEqual(2);
  });
  it('insertLockedInteractions : does not insert if already in list', () => {
    // GIVEN
    const il1 = new Interaction(
      TestUtil.interactionData({ id: 'l1', locked: true }),
    );
    const i1 = new Interaction(TestUtil.interactionData({ id: 'l1' }));
    const locked_list = [il1];
    const work_list = [i1];

    // WHEN
    const result = DistributionSettings.insertLockedInteractions(
      locked_list,
      work_list,
    );

    // THEN
    expect(result).toHaveLength(1);
    const id_list = result.map((inter) => inter.id);
    expect(id_list).toStrictEqual(['l1']);
  });
  it('insertLockedInteractions : insert locked interactions at configured position', () => {
    // GIVEN
    const il1 = new Interaction(
      TestUtil.interactionData({ id: 'l1', locked: true }),
    );
    const il2 = new Interaction(
      TestUtil.interactionData({ id: 'l2', locked: true }),
    );
    const il3 = new Interaction(
      TestUtil.interactionData({ id: 'l3', locked: true }),
    );
    const i1 = new Interaction(TestUtil.interactionData({ id: '1' }));
    const i2 = new Interaction(TestUtil.interactionData({ id: '2' }));
    const i3 = new Interaction(TestUtil.interactionData({ id: '3' }));
    const i4 = new Interaction(TestUtil.interactionData({ id: '4' }));
    const i5 = new Interaction(TestUtil.interactionData({ id: '5' }));
    const i6 = new Interaction(TestUtil.interactionData({ id: '6' }));
    const locked_list = [il1, il2, il3];
    const work_list = [i1, i2, i3, i4, i5, i6];

    // WHEN
    const result = DistributionSettings.insertLockedInteractions(
      locked_list,
      work_list,
    );

    // THEN
    expect(result).toHaveLength(9);
    const id_list = result.map((inter) => inter.id);
    expect(id_list).toStrictEqual([
      '1',
      '2',
      'l1',
      '3',
      '4',
      'l2',
      '5',
      '6',
      'l3',
    ]);
  });
  it('insertLockedInteractions : insert less locked when less available', () => {
    // GIVEN
    const il1 = new Interaction(
      TestUtil.interactionData({ id: 'l1', locked: true }),
    );
    const i1 = new Interaction(TestUtil.interactionData({ id: '1' }));
    const i2 = new Interaction(TestUtil.interactionData({ id: '2' }));
    const i3 = new Interaction(TestUtil.interactionData({ id: '3' }));
    const i4 = new Interaction(TestUtil.interactionData({ id: '4' }));
    const i5 = new Interaction(TestUtil.interactionData({ id: '5' }));
    const locked_list = [il1];
    const work_list = [i1, i2, i3, i4, i5];

    // WHEN
    const result = DistributionSettings.insertLockedInteractions(
      locked_list,
      work_list,
    );

    // THEN
    expect(result).toHaveLength(6);
    const id_list = result.map((inter) => inter.id);
    expect(id_list).toStrictEqual(['1', '2', 'l1', '3', '4', '5']);
  });
  it('insertLockedInteractions : reposition already present locked interactions', () => {
    // GIVEN
    const il1 = new Interaction(
      TestUtil.interactionData({ id: 'l1', locked: true }),
    );
    const il2 = new Interaction(
      TestUtil.interactionData({ id: 'l2', locked: true }),
    );
    const i3 = new Interaction(TestUtil.interactionData({ id: '3' }));
    const i4 = new Interaction(TestUtil.interactionData({ id: '4' }));
    const i5 = new Interaction(TestUtil.interactionData({ id: '5' }));
    const i6 = new Interaction(TestUtil.interactionData({ id: '6' }));
    const i7 = new Interaction(TestUtil.interactionData({ id: '7' }));
    const work_list = [il1, il2, i3, i4, i5, i6, i7];

    // WHEN
    const result = DistributionSettings.insertLockedInteractions([], work_list);

    // THEN
    expect(result).toHaveLength(7);
    const id_list = result.map((inter) => inter.id);
    expect(id_list).toStrictEqual(['3', '4', 'l1', '5', '6', 'l2', '7']);
  });
  it('insertLockedInteractions : reposition and inserts remaining locked', () => {
    // GIVEN
    const il1 = new Interaction(
      TestUtil.interactionData({ id: 'l1', locked: true }),
    );
    const il2 = new Interaction(
      TestUtil.interactionData({ id: 'l2', locked: true }),
    );
    const il3 = new Interaction(
      TestUtil.interactionData({ id: 'l3', locked: true }),
    );
    const i3 = new Interaction(TestUtil.interactionData({ id: '3' }));
    const i4 = new Interaction(TestUtil.interactionData({ id: '4' }));
    const i5 = new Interaction(TestUtil.interactionData({ id: '5' }));
    const i6 = new Interaction(TestUtil.interactionData({ id: '6' }));
    const i7 = new Interaction(TestUtil.interactionData({ id: '7' }));
    const i8 = new Interaction(TestUtil.interactionData({ id: '8' }));
    const work_list = [il1, il2, i3, i4, i5, i6, i7, i8];

    // WHEN
    const result = DistributionSettings.insertLockedInteractions(
      [il3],
      work_list,
    );

    // THEN
    expect(result).toHaveLength(9);
    const id_list = result.map((inter) => inter.id);
    expect(id_list).toStrictEqual([
      '3',
      '4',
      'l1',
      '5',
      '6',
      'l2',
      '7',
      '8',
      'l3',
    ]);
  });
  it('insertLockedInteractions : position locked at end when not enough unlocked', () => {
    // GIVEN
    const il1 = new Interaction(
      TestUtil.interactionData({ id: 'l1', locked: true }),
    );
    const il2 = new Interaction(
      TestUtil.interactionData({ id: 'l2', locked: true }),
    );
    const il3 = new Interaction(
      TestUtil.interactionData({ id: 'l3', locked: true }),
    );
    const i1 = new Interaction(TestUtil.interactionData({ id: '1' }));
    const i2 = new Interaction(TestUtil.interactionData({ id: '2' }));
    const i3 = new Interaction(TestUtil.interactionData({ id: '3' }));
    const work_list = [il1, il2, i1, i2, i3];

    // WHEN
    const result = DistributionSettings.insertLockedInteractions(
      [il3],
      work_list,
    );

    // THEN
    expect(result).toHaveLength(6);
    const id_list = result.map((inter) => inter.id);
    expect(id_list).toStrictEqual(['1', '2', 'l1', '3', 'l2', 'l3']);
  });
  it('insertLockedInteractions : does not change position of fully locked item list', () => {
    // GIVEN
    const il1 = new Interaction(
      TestUtil.interactionData({ id: 'l1', locked: true }),
    );
    const il2 = new Interaction(
      TestUtil.interactionData({ id: 'l2', locked: true }),
    );
    const il3 = new Interaction(
      TestUtil.interactionData({ id: 'l3', locked: true }),
    );
    const il5 = new Interaction(
      TestUtil.interactionData({ id: 'l5', locked: true }),
    );
    const il6 = new Interaction(
      TestUtil.interactionData({ id: 'l6', locked: true }),
    );
    const work_list = [il1, il2, il3];

    // WHEN
    DistributionSettings.insertLockedInteractions([il5, il6], work_list);

    // THEN
    expect(work_list).toHaveLength(3);
    const id_list = work_list.map((inter) => inter.id);
    expect(id_list).toStrictEqual(['l1', 'l2', 'l3']);
  });
});
