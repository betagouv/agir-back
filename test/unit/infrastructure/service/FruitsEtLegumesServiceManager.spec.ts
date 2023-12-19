import { FruitsEtLegumesServiceManager } from '../../../../src/infrastructure/service/fruits/fruitEtLegumesServiceManager';

describe('FruitsEtLegumesServiceManager', () => {
  it.skip('constructor : load file with no exception', () => {
    //WHEN
    new FruitsEtLegumesServiceManager();
    //THEN
    // No exception
  });
  /*
  it.skip('constructor : load file with no exception', () => {
    //WHEN
    new FruitsEtLegumesServiceManager();
    //THEN
    // No exception
  });
  it.skip('computeLiveDynamicData : load given input', () => {
    //WHEN
    new FruitsEtLegumesServiceManager([
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
    //THEN
    // No exception
  });
  it.skip('computeLiveDynamicData : select proper data', async () => {
    // GIVEN
    const manager = new FruitsEtLegumesServiceManager([
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
  it.skip('filterOutHighCO2Entries : filter out bad CO2 entries', async () => {
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
    const result = manager.filterOutHighCO2Entries(list);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0].label).toEqual('A');
  });
  it.skip('filterOutHighCO2Entries : do not filter out when not nough elements', async () => {
    // GIVEN
    const list = [
      { label: 'A', co2: 1 },
      { label: 'B', co2: 2 },
      { label: 'C', co2: 3 },
    ];
    const manager = new FruitsEtLegumesServiceManager();

    // WHEN
    const result = manager.filterOutHighCO2Entries(list);

    // THEN
    expect(result).toHaveLength(3);
  });
  */
});
