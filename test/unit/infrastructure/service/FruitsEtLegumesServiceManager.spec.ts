import {
  FruitLegume,
  FruitsEtLegumesServiceManager,
} from '../../../../src/infrastructure/service/fruits/fruitEtLegumesServiceManager';

describe('FruitsEtLegumesServiceManager', () => {
  it('constructor : load file with no exception', () => {
    //WHEN
    new FruitsEtLegumesServiceManager();
    //THEN
    // No exception
  });
  it('loadFruitsData : load given input', () => {
    //WHEN
    const manager = new FruitsEtLegumesServiceManager();
    manager.loadFruitsData([
      {
        label: { fr: 'Orange' },
        months: [0, 1, 2],
        emoji: '🍊',
        local: false,
        pef: 0.2,
        CO2: 0.97,
      },
      {
        label: { fr: 'Ail' },
        months: [2, 6, 7, 8, 9, 10, 11],
        emoji: '🌱',
        local: true,
        pef: 0.07,
        CO2: 0.37,
      },
    ]);
    //THEN
    expect(manager.getMonthEntries(0)).toHaveLength(1);
    expect(manager.getMonthEntries(2)).toHaveLength(2);
    expect(manager.getMonthEntries(10)).toHaveLength(1);
  });
  it('loadFruitsData : load given input', () => {
    //WHEN
    const manager = new FruitsEtLegumesServiceManager();
    manager.loadFruitsData([
      {
        label: { fr: 'Orange' },
        months: [0, 1, 2],
        emoji: '🍊',
        local: false,
        pef: 0.2,
        CO2: 0.97,
      },
      {
        label: { fr: 'Ail' },
        months: [2, 6, 7, 8, 9, 10, 11],
        emoji: '🌱',
        local: true,
        pef: 0.07,
        CO2: 0.37,
      },
    ]);
    //THEN
    expect(manager.getMonthEntries(0)).toHaveLength(1);
    expect(manager.getMonthEntries(2)).toHaveLength(2);
    expect(manager.getMonthEntries(10)).toHaveLength(1);
  });
  it('loadFruitsData : getByName emoji & type', () => {
    //WHEN
    const manager = new FruitsEtLegumesServiceManager();
    manager.loadFruitsData([
      {
        label: { fr: 'Orange' },
        months: [0, 1, 2],
        emoji: '🍊',
        local: false,
        pef: 0.2,
        CO2: 0.97,
        type: FruitLegume.fruit,
      },
    ]);
    //THEN
    expect(manager.getEmoji('Orange')).toEqual('🍊');
    expect(manager.getType('Orange')).toEqual(FruitLegume.fruit);
  });
  it('computeLiveDynamicData : select proper data', async () => {
    // GIVEN
    const manager = new FruitsEtLegumesServiceManager();
    manager.loadFruitsData([
      {
        label: { fr: 'Orange' },
        months: [0, 1, 2],
        emoji: '🍊',
        local: false,
        pef: 0.2,
        CO2: 0.97,
      },
      {
        label: { fr: 'Ail' },
        months: [6, 7, 8, 9, 10, 11],
        emoji: '🌱',
        local: true,
        pef: 0.07,
        CO2: 0.37,
      },
    ]);
    // WHEN
    const result = await manager.computeDataForGivenMonth(0);

    // THEN
    expect(result.label).toEqual('🍊 Orange');
  });
  it('filterOutHighCO2Entries : filter out bad CO2 entries', async () => {
    // GIVEN
    const list = [
      { label: 'A', co2: 1 },
      { label: 'B', co2: 2 },
      { label: 'C', co2: 3 },
      { label: 'D', co2: 4 },
      { label: 'E', co2: 5 },
      { label: 'F', co2: 6 },
    ];
    const manager = new FruitsEtLegumesServiceManager();

    // WHEN
    const result = manager.filterOutHighCO2MonthEntries(list);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0].label).toEqual('A');
  });
  it('filterOutHighCO2Entries : do not filter out when not nough elements', async () => {
    // GIVEN
    const list = [
      { label: 'A', co2: 1 },
      { label: 'B', co2: 2 },
      { label: 'C', co2: 3 },
    ];
    const manager = new FruitsEtLegumesServiceManager();

    // WHEN
    const result = manager.filterOutHighCO2MonthEntries(list);

    // THEN
    expect(result).toHaveLength(3);
  });
});
