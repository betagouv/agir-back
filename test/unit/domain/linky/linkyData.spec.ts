import {
  LinkyData,
  MonthLinkyData,
  YearMonthLinkyData,
} from '../../../../src/domain/linky/linkyData';

describe('LinkyData', () => {
  it('extractLastNDays : extract last 2 days with proper labels ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          time: new Date('2021-12-21T12:00:00.000Z'),
          value: 0,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2021-12-22T12:00:00.000Z'),
          value: 0,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2021-12-23T12:00:00.000Z'),
          value: 0,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2021-12-24T12:00:00.000Z'),
          value: 0,
          value_at_normal_temperature: 1,
        },
      ],
    });

    // WHEN
    const result = linkyData.extractLastNDays(2);

    // THEN
    expect(result).toHaveLength(2);
    expect(result[0].jour).toEqual('jeudi');
    expect(result[1].jour).toEqual('vendredi');
  });
  it('extractLastNDays : extract last 2 days with proper labels ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [],
    });
    const current_date = new Date('2021-12-01T12:00:00.000Z');
    for (let index = 1; index < 31; index++) {
      current_date.setDate(index);
      linkyData.serie.push({
        time: new Date(current_date.getTime()),
        value: index,
        value_at_normal_temperature: index * 10,
      });
    }

    // WHEN
    const result = linkyData.extractLastNWeeks(2);

    // THEN
    expect(result).toHaveLength(2);
    expect(result[0].value).toEqual(140);
    expect(result[0].value_at_normal_temperature).toEqual(1400);
    expect(result[1].value).toEqual(189);
    expect(result[1].value_at_normal_temperature).toEqual(1890);
  });
  it('fillRequiredYearMonthsData : extract nothing if no data ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [],
    });

    const input = new YearMonthLinkyData();
    input.years.set(2024, new MonthLinkyData());
    input.years.get(2024).months.set(1, []);

    // WHEN
    linkyData.fillRequiredYearMonthsData(input);

    // THEN
    expect(input.years.get(2024).months.get(1)).toHaveLength(0);
  });
  it('fillRequiredYearMonthsData : extract proper date ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          time: new Date('2021-12-21T12:00:00.000Z'),
          value: 11,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2021-11-05T12:00:00.000Z'),
          value: 22,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-01-10T12:00:00.000Z'),
          value: 33,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-02-23T12:00:00.000Z'),
          value: 44,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-03-24T12:00:00.000Z'),
          value: 55,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-03-25T12:00:00.000Z'),
          value: 66,
          value_at_normal_temperature: 1,
        },
      ],
    });

    const input = new YearMonthLinkyData();

    input.years.set(2021, new MonthLinkyData());
    input.years.get(2021).months.set(10, []);

    input.years.set(2022, new MonthLinkyData());
    input.years.get(2022).months.set(0, []);
    input.years.get(2022).months.set(2, []);

    // WHEN
    linkyData.fillRequiredYearMonthsData(input);

    // THEN
    expect(input.years.size).toEqual(2);
    expect(input.years.get(2021).months.get(10)).toHaveLength(1);
    expect(input.years.get(2021).months.get(10)[0].value).toEqual(22);

    expect(input.years.get(2022).months.get(0)).toHaveLength(1);
    expect(input.years.get(2022).months.get(0)[0].value).toEqual(33);

    expect(input.years.get(2022).months.get(2)).toHaveLength(2);
    expect(input.years.get(2022).months.get(2)[0].value).toEqual(55);
    expect(input.years.get(2022).months.get(2)[1].value).toEqual(66);
  });
  it('extractLastNMonths : extract proper data for 3 last months ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          time: new Date('2021-12-21T12:00:00.000Z'),
          value: 11,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2021-11-05T12:00:00.000Z'),
          value: 22,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-01-10T12:00:00.000Z'),
          value: 33,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-02-23T12:00:00.000Z'),
          value: 44,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-03-24T12:00:00.000Z'),
          value: 55,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-03-25T12:00:00.000Z'),
          value: 66,
          value_at_normal_temperature: 1,
        },
      ],
    });

    // WHEN
    const result = linkyData.extractLastNMonths(
      4,
      new Date('2022-03-28T12:00:00.000Z'),
    );

    // THEN
    expect(result).toHaveLength(4);

    expect(result[0].mois).toEqual('décembre');
    expect(result[1].mois).toEqual('janvier');
    expect(result[2].mois).toEqual('février');
    expect(result[3].mois).toEqual('mars');

    expect(result[0].annee).toEqual('2021');
    expect(result[1].annee).toEqual('2022');
    expect(result[2].annee).toEqual('2022');
    expect(result[3].annee).toEqual('2022');

    expect(result[0].value).toEqual(11);
    expect(result[1].value).toEqual(33);
    expect(result[2].value).toEqual(44);
    expect(result[3].value).toEqual(121);
    expect(result[3].value_at_normal_temperature).toEqual(2);
  });
  it('extractLastNMonths : handles ok empty months ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          time: new Date('2021-12-21T12:00:00.000Z'),
          value: 11,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2021-11-05T12:00:00.000Z'),
          value: 22,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-01-10T12:00:00.000Z'),
          value: 33,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-03-24T12:00:00.000Z'),
          value: 55,
          value_at_normal_temperature: 1,
        },
        {
          time: new Date('2022-03-25T12:00:00.000Z'),
          value: 66,
          value_at_normal_temperature: 1,
        },
      ],
    });

    // WHEN
    const result = linkyData.extractLastNMonths(
      4,
      new Date('2022-04-28T12:00:00.000Z'),
    );

    // THEN
    expect(result).toHaveLength(4);

    expect(result[0].mois).toEqual('janvier');
    expect(result[1].mois).toEqual('février');
    expect(result[2].mois).toEqual('mars');
    expect(result[3].mois).toEqual('avril');

    expect(result[0].annee).toEqual('2022');
    expect(result[1].annee).toEqual('2022');
    expect(result[2].annee).toEqual('2022');
    expect(result[3].annee).toEqual('2022');

    expect(result[0].value).toEqual(33);
    expect(result[1].value).toEqual(0);
    expect(result[2].value).toEqual(121);
    expect(result[3].value).toEqual(0);
  });
  it('listMonthsFromDate : list months backward from date ', () => {
    // GIVEN

    // WHEN
    const result = LinkyData.listMonthsFromDate(
      4,
      new Date('2022-03-24T12:00:00.000Z'),
    );

    // THEN
    expect(result.years.size).toEqual(2);
    expect(result.years.get(2022).months.size).toEqual(3);
    expect(result.years.get(2022).months.get(0)).toEqual([]);
    expect(result.years.get(2022).months.get(1)).toEqual([]);
    expect(result.years.get(2022).months.get(2)).toEqual([]);
    expect(result.years.get(2021).months.size).toEqual(1);
    expect(result.years.get(2021).months.get(11)).toEqual([]);
  });
});
