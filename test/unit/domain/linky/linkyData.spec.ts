import {
  LinkyData,
  MonthLinkyData,
  YearMonthLinkyData,
} from '../../../../src/domain/linky/linkyData';
const _linky_data = require('../../../../test_data/PRM_thermo_sensible');

describe('LinkyData', () => {
  it('getLastValue : null if no value', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [],
    });

    // WHEN
    const result = linkyData.getLastRoundedValue();

    // THEN
    expect(result).toBeNull();
  });
  it('getLastValue :correct value', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 0,
        },
        {
          date: new Date('2021-12-22T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 2,
        },
      ],
    });

    // WHEN
    const result = linkyData.getLastRoundedValue();

    // THEN
    expect(result).toEqual(2);
  });
  it('getLastValue :correct rounded value', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 12.123456876,
        },
      ],
    });

    // WHEN
    const result = linkyData.getLastRoundedValue();

    // THEN
    expect(result).toEqual(12.123);
  });
  it('getLastVariation : null not long enough', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [],
    });

    // WHEN
    const result = linkyData.getLastVariation();

    // THEN
    expect(result).toBeNull();
  });
  it('getLastVariation : null not long enough', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 0,
        },
      ],
    });

    // WHEN
    const result = linkyData.getLastVariation();

    // THEN
    expect(result).toBeNull();
  });
  it('getLastVariation : correct pourcent', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 10,
        },
        {
          date: new Date('2021-12-22T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 12,
        },
      ],
    });

    // WHEN
    const result = linkyData.getLastVariation();

    // THEN
    expect(result.pourcent).toEqual(20);
    expect(result.day).toEqual('mercredi');
  });
  it('getLastVariation : correct negative pourcent', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 10,
        },
        {
          date: new Date('2021-12-22T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 8,
        },
      ],
    });

    // WHEN
    const result = linkyData.getLastVariation();

    // THEN
    expect(result.pourcent).toEqual(-20);
  });
  it('getLastVariation : correct pourcent 2 digits after comma', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 14,
        },
        {
          date: new Date('2021-12-22T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 15,
        },
      ],
    });

    // WHEN
    const result = linkyData.getLastVariation();

    // THEN
    expect(result.pourcent).toEqual(7.14);
  });
  it('extractLastNDays : extract last 2 days with proper labels ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 0,
        },
        {
          date: new Date('2021-12-22T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 0,
        },
        {
          date: new Date('2021-12-23T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 0,
        },
        {
          date: new Date('2021-12-24T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 0,
        },
      ],
    });

    // WHEN
    const result = linkyData.extractLastNDays(2);

    // THEN
    expect(result).toHaveLength(2);
    expect(result[0].jour_text).toEqual('jeudi');
    expect(result[1].jour_text).toEqual('vendredi');
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
        date: new Date(current_date.getTime()),
        day_value: index,
        value_cumulee: null,
      });
    }

    // WHEN
    const result = linkyData.extractLastNWeeks(2);

    // THEN
    expect(result).toHaveLength(2);
    expect(result[0].day_value).toEqual(140);
    expect(result[1].day_value).toEqual(189);
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
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 11,
        },
        {
          date: new Date('2021-11-05T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 22,
        },
        {
          date: new Date('2022-01-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 33,
        },
        {
          date: new Date('2022-02-23T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 44,
        },
        {
          date: new Date('2022-03-24T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 55,
        },
        {
          date: new Date('2022-03-25T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 66,
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
    expect(input.years.get(2021).months.get(10)[0].day_value).toEqual(22);

    expect(input.years.get(2022).months.get(0)).toHaveLength(1);
    expect(input.years.get(2022).months.get(0)[0].day_value).toEqual(33);

    expect(input.years.get(2022).months.get(2)).toHaveLength(2);
    expect(input.years.get(2022).months.get(2)[0].day_value).toEqual(55);
    expect(input.years.get(2022).months.get(2)[1].day_value).toEqual(66);
  });
  it('extractLastNMonths : extract proper data for 3 last months ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 11,
        },
        {
          date: new Date('2021-11-05T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 22,
        },
        {
          date: new Date('2022-01-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 33,
        },
        {
          date: new Date('2022-02-23T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 44,
        },
        {
          date: new Date('2022-03-24T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 55,
        },
        {
          date: new Date('2022-03-25T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 66,
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

    expect(result[0].day_value).toEqual(11);
    expect(result[1].day_value).toEqual(33);
    expect(result[2].day_value).toEqual(44);
    expect(result[3].day_value).toEqual(121);
  });
  it('extractLastNMonths : handles ok empty months ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 11,
        },
        {
          date: new Date('2021-11-05T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 22,
        },
        {
          date: new Date('2022-01-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 33,
        },
        {
          date: new Date('2022-03-24T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 55,
        },
        {
          date: new Date('2022-03-25T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 66,
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

    expect(result[0].day_value).toEqual(33);
    expect(result[1].day_value).toEqual(0);
    expect(result[2].day_value).toEqual(121);
    expect(result[3].day_value).toEqual(0);
  });
  it('extractLastNMonths : handles ok le premier janvier ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2000-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 100,
        },
        {
          date: new Date('2001-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 110,
        },
      ],
    });

    // WHEN
    const result = linkyData.extractLastNMonths(
      24,
      new Date('2001-01-01T12:00:00.000Z'),
    );

    // THEN
    expect(result).toHaveLength(24);

    expect(result[23].annee).toEqual('2001');
    expect(result[23].day_value).toEqual(110);
    expect(result[23].mois).toEqual('janvier');

    expect(result[11].annee).toEqual('2000');
    expect(result[11].day_value).toEqual(100);
    expect(result[11].mois).toEqual('janvier');

    expect(result[22].day_value).toEqual(0);
    expect(result[13].day_value).toEqual(0);
    expect(result[10].day_value).toEqual(0);
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
  it('cleanData : order inner serie by descending dates ', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2022-03-24T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 33,
        },
        {
          date: new Date('2022-01-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 11,
        },
        {
          date: new Date('2022-02-25T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 22,
        },
      ],
    });

    // WHEN
    linkyData.cleanData();

    // THEN
    expect(linkyData.serie[0].day_value).toEqual(11);
    expect(linkyData.serie[1].day_value).toEqual(22);
    expect(linkyData.serie[2].day_value).toEqual(33);
  });
  it('cleanData : supprime les doublons de date par un parcours gauche droite ddes série (réception ancienne vers nouvelles)', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2022-01-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 11,
        },
        {
          date: new Date('2022-03-24T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 33,
        },
        {
          date: new Date('2022-01-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 12,
        },
        {
          date: new Date('2022-03-24T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 34,
        },
      ],
    });

    // WHEN
    linkyData.cleanData();

    // THEN
    expect(linkyData.serie).toHaveLength(2);
    expect(linkyData.serie[0].day_value).toEqual(12);
    expect(linkyData.serie[1].day_value).toEqual(34);
  });
  it('compare2AnsParMois : extait correctement 24 mois', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2000-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 1,
        },
        {
          date: new Date('2000-02-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 2,
        },
        {
          date: new Date('2000-03-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 3,
        },
        {
          date: new Date('2000-04-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 4,
        },
        {
          date: new Date('2000-05-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 5,
        },
        {
          date: new Date('2000-06-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 6,
        },
        {
          date: new Date('2000-07-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 7,
        },
        {
          date: new Date('2000-08-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 8,
        },
        {
          date: new Date('2000-09-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 9,
        },
        {
          date: new Date('2000-10-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 10,
        },
        {
          date: new Date('2000-11-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 11,
        },
        {
          date: new Date('2000-12-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 12,
        },
        {
          date: new Date('2000-12-02T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 13,
        },
        //############################################
        {
          date: new Date('2001-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 10,
        },
        {
          date: new Date('2001-02-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 20,
        },
        {
          date: new Date('2001-03-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 30,
        },
        {
          date: new Date('2001-04-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 40,
        },
        {
          date: new Date('2001-05-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 50,
        },
        {
          date: new Date('2001-06-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 60,
        },
        {
          date: new Date('2001-07-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 70,
        },
        {
          date: new Date('2001-08-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 80,
        },
        {
          date: new Date('2001-09-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 90,
        },
        {
          date: new Date('2001-10-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 100,
        },
        {
          date: new Date('2001-11-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 110,
        },
        {
          date: new Date('2001-12-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 120,
        },
        {
          date: new Date('2001-12-02T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 130,
        },
      ],
    });

    // WHEN
    const result = linkyData.compare2AnsParMois().data;

    // THEN
    expect(result).toHaveLength(24);
    expect(result[0].day_value).toEqual(1);
    expect(result[1].day_value).toEqual(10);
    expect(result[2].day_value).toEqual(2);
    expect(result[3].day_value).toEqual(20);
    expect(result[4].day_value).toEqual(3);
    expect(result[5].day_value).toEqual(30);
  });
  it('compare2AnsParMois : commentaire sur set complet', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: JSON.parse(JSON.stringify(_linky_data)),
    });

    // WHEN
    const result = linkyData.compare2AnsParMois();

    // THEN
    expect(result.data).toHaveLength(24);
    expect(result.commentaires[0]).toEqual(
      'Au cours des 12 derniers mois, votre consommation éléctrique a <strong>augmenté de +3%</strong> par rapport aux 12 mois précédents',
    );
    expect(result.commentaires[1]).toEqual(
      `C'est au mois de <strong>janvier 2023</strong> que vous avez fait le <strong>plus d'économie d’électricité</strong> (<strong>-10%</strong> par rapport à janvier 2022)`,
    );
    expect(result.commentaires[2]).toEqual(
      `C'est au mois de <strong>novembre 2023</strong> que votre consommation d’électricité a le plus augmenté (<strong>+51%</strong> par rapport à novembre 2022)</strong>`,
    );
  });
  it('compare2AnsParMois : commentaires de bonne valeur, exclusion du dernier mois', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2000-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 100,
        },
        {
          date: new Date('2000-02-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 100,
        },
        {
          date: new Date('2000-03-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 100,
        },
        {
          date: new Date('2000-04-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 100,
        },
        {
          date: new Date('2001-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 110,
        },
        {
          date: new Date('2001-02-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 120,
        },
        {
          date: new Date('2001-03-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 80,
        },
        {
          date: new Date('2001-04-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 50,
        },
      ],
    });

    // WHEN
    const result = linkyData.compare2AnsParMois();

    // THEN
    expect(result.data).toHaveLength(24);
    expect(result.commentaires[0]).toEqual(
      'Au cours des 12 derniers mois, votre consommation éléctrique a <strong>diminué de -10%</strong> par rapport aux 12 mois précédents',
    );
    expect(result.commentaires[1]).toEqual(
      `C'est au mois de <strong>mars 2001</strong> que vous avez fait le <strong>plus d'économie d’électricité</strong> (<strong>-20%</strong> par rapport à mars 2000)`,
    );
    expect(result.commentaires[2]).toEqual(
      `C'est au mois de <strong>février 2001</strong> que votre consommation d’électricité a le plus augmenté (<strong>+20%</strong> par rapport à février 2000)</strong>`,
    );
  });

  it('getPreviousWeekFirstDay : renvoie le lundi précédent précédent', () => {
    // GIVEN
    // WHEN
    const day = LinkyData.getPreviousWeekFirstDay(new Date('2024-01-24'));

    // THEN
    expect(day.toLocaleDateString('fr-FR')).toEqual('15/01/2024');
  });
  it('getPreviousWeekFirstDay : renvoie le lundi précédent précédent partant de dimanche', () => {
    // GIVEN
    // WHEN
    const day = LinkyData.getPreviousWeekFirstDay(new Date('2024-01-21'));

    // THEN
    expect(day.toLocaleDateString('fr-FR')).toEqual('08/01/2024');
  });
  it('getPreviousWeekFirstDay : renvoie le lundi précédent partant de lundi', () => {
    // GIVEN
    // WHEN
    const day = LinkyData.getPreviousWeekFirstDay(new Date('2024-01-22'));

    // THEN
    expect(day.toLocaleDateString('fr-FR')).toEqual('15/01/2024');
  });
  it('getPreviousWeekLastDay : renvoie le dimanche précédent', () => {
    // GIVEN
    // WHEN
    const day = LinkyData.getPreviousWeekLastDay(new Date('2024-01-24'));

    // THEN
    expect(day.toLocaleDateString('fr-FR')).toEqual('21/01/2024');
  });
  it('getPreviousWeekLastDay : renvoie le dimanche précédent précédent partant de dimanche', () => {
    // GIVEN
    // WHEN
    const day = LinkyData.getPreviousWeekLastDay(new Date('2024-01-21'));

    // THEN
    expect(day.toLocaleDateString('fr-FR')).toEqual('14/01/2024');
  });
  it('searchDay : renvoie les bon enregirtrement', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2000-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 1,
        },
        {
          date: new Date('2000-01-02T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 2,
        },
        {
          date: new Date('2000-01-03T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 3,
        },
        {
          date: new Date('2000-01-04T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 4,
        },
        {
          date: new Date('2000-01-05T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 5,
        },
        {
          date: new Date('2000-01-06T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 6,
        },
      ],
    });
    // WHEN
    const elems = linkyData.searchDays(
      new Date('2000-01-03'),
      new Date('2000-01-05'),
    );

    // THEN
    expect(elems).toHaveLength(3);
    expect(elems[0].day_value).toEqual(3);
    expect(elems[1].day_value).toEqual(4);
    expect(elems[2].day_value).toEqual(5);
  });

  it('searchSingleDay : renvoie les bon enregirtrement', () => {
    // GIVEN
    const linkyData = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2000-01-01T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 1,
        },
        {
          date: new Date('2000-01-02T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 2,
        },
      ],
    });
    // WHEN
    const elem = linkyData.searchSingleDay(
      new Date('2000-01-02T12:00:00.000Z'),
    );

    // THEN
    expect(elem.day_value).toEqual(2);
  });
  it('compare15jousEntre2ans : [] si pas de données du tout', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: [],
    });

    // WHEN
    const res = linky_data.compare14joursEntre2ans();

    // THEN
    expect(res.data).toHaveLength(0);
    expect(res.commentaires).toHaveLength(0);
  });
  it('compare15jousEntre2ans : [] si pas assez de données', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2021-12-21T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 0,
        },
        {
          date: new Date('2021-12-22T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 2,
        },
      ],
    });

    // WHEN
    const res = linky_data.compare14joursEntre2ans().data;

    // THEN
    expect(res).toHaveLength(0);
  });
  it('compare15jousEntre2ans : 28 elements de base', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: JSON.parse(JSON.stringify(_linky_data)),
    });

    // WHEN
    const res = linky_data.compare14joursEntre2ans().data;

    // THEN
    expect(res).toHaveLength(28);
  });
  it('compare15jousEntre2ans :valeurs OK', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: JSON.parse(JSON.stringify(_linky_data)),
    });

    // WHEN
    const result = linky_data.compare14joursEntre2ans();
    const res = result.data;

    // THEN
    expect(res).toHaveLength(28);

    expect(res[0].annee).toEqual('2022');
    expect(res[0].mois).toEqual('novembre');
    expect(res[0].jour_text).toEqual('mercredi');
    expect(res[0].jour_val).toEqual(30);
    expect(res[1].annee).toEqual('2023');
    expect(res[1].mois).toEqual('novembre');
    expect(res[1].jour_text).toEqual('jeudi');
    expect(res[1].jour_val).toEqual(30);

    expect(res[26].annee).toEqual('2022');
    expect(res[26].mois).toEqual('décembre');
    expect(res[26].jour_text).toEqual('mardi');
    expect(res[26].jour_val).toEqual(13);
    expect(res[27].annee).toEqual('2023');
    expect(res[27].mois).toEqual('décembre');
    expect(res[27].jour_text).toEqual('mercredi');
    expect(res[27].jour_val).toEqual(13);

    expect(result.commentaires).toHaveLength(2);
    expect(result.commentaires[0]).toEqual(
      `Votre consommation a <strong>augmenté de +34.21%</strong> entre mardi et mercredi dernier`,
    );
    expect(result.commentaires[1]).toEqual(
      `Au cours des 2 dernières semaines, votre consommation éléctrique a <strong>augmenté de +15%</strong> par rapport à la même période l'année dernière`,
    );
  });
  it('compare15jousEntre2ans : data partielle OK 7 jours au lieu de 14', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2022-12-07T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 19.684,
        },
        {
          date: new Date('2022-12-08T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 17.606,
        },
        {
          date: new Date('2022-12-09T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 25.669,
        },
        {
          date: new Date('2022-12-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 27.912,
        },
        {
          date: new Date('2022-12-11T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 31.666,
        },
        {
          date: new Date('2022-12-12T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 20.935,
        },
        {
          date: new Date('2022-12-13T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 29.003,
        },
        {
          date: new Date('2023-12-07T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 29.613,
        },
        {
          date: new Date('2023-12-08T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 20.153,
        },
        {
          date: new Date('2023-12-09T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 19.462,
        },
        {
          date: new Date('2023-12-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 21.578,
        },
        {
          date: new Date('2023-12-11T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 15.265,
        },
        {
          date: new Date('2023-12-12T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 13.681,
        },
        {
          date: new Date('2023-12-13T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 18.362,
        },
      ],
    });

    // WHEN
    const res = linky_data.compare14joursEntre2ans().data;

    // THEN
    expect(res).toHaveLength(14);
    expect(res[0].annee).toEqual('2022');
    expect(res[0].mois).toEqual('décembre');
    expect(res[0].jour_text).toEqual('mercredi');
    expect(res[0].jour_val).toEqual(7);
    expect(res[1].annee).toEqual('2023');
    expect(res[1].mois).toEqual('décembre');
    expect(res[1].jour_text).toEqual('jeudi');
    expect(res[1].jour_val).toEqual(7);

    expect(res[12].annee).toEqual('2022');
    expect(res[12].mois).toEqual('décembre');
    expect(res[12].jour_text).toEqual('mardi');
    expect(res[12].jour_val).toEqual(13);
    expect(res[13].annee).toEqual('2023');
    expect(res[13].mois).toEqual('décembre');
    expect(res[13].jour_text).toEqual('mercredi');
    expect(res[13].jour_val).toEqual(13);
  });
  it('compare15jousEntre2ans : data partielle OK 7 jours au lieu de 14, coupure au restant de l annee d avant', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2022-12-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 27.912,
        },
        {
          date: new Date('2022-12-11T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 31.666,
        },
        {
          date: new Date('2022-12-12T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 20.935,
        },
        {
          date: new Date('2022-12-13T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 29.003,
        },

        {
          date: new Date('2023-12-07T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 29.613,
        },
        {
          date: new Date('2023-12-08T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 20.153,
        },
        {
          date: new Date('2023-12-09T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 19.462,
        },
        {
          date: new Date('2023-12-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 21.578,
        },
        {
          date: new Date('2023-12-11T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 15.265,
        },
        {
          date: new Date('2023-12-12T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 13.681,
        },
        {
          date: new Date('2023-12-13T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 18.362,
        },
      ],
    });

    // WHEN
    const res = linky_data.compare14joursEntre2ans().data;

    // THEN
    expect(res).toHaveLength(8);
    expect(res[0].annee).toEqual('2022');
    expect(res[0].mois).toEqual('décembre');
    expect(res[0].jour_text).toEqual('samedi');
    expect(res[0].jour_val).toEqual(10);
    expect(res[1].annee).toEqual('2023');
    expect(res[1].mois).toEqual('décembre');
    expect(res[1].jour_text).toEqual('dimanche');
    expect(res[1].jour_val).toEqual(10);

    expect(res[6].annee).toEqual('2022');
    expect(res[6].mois).toEqual('décembre');
    expect(res[6].jour_text).toEqual('mardi');
    expect(res[6].jour_val).toEqual(13);
    expect(res[7].annee).toEqual('2023');
    expect(res[7].mois).toEqual('décembre');
    expect(res[7].jour_text).toEqual('mercredi');
    expect(res[7].jour_val).toEqual(13);
  });
  it('compare15jousEntre2ans : pas de data y a un an...', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2023-12-07T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 29.613,
        },
        {
          date: new Date('2023-12-08T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 20.153,
        },
        {
          date: new Date('2023-12-09T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 19.462,
        },
        {
          date: new Date('2023-12-10T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 21.578,
        },
        {
          date: new Date('2023-12-11T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 15.265,
        },
        {
          date: new Date('2023-12-12T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 13.681,
        },
        {
          date: new Date('2023-12-13T12:00:00.000Z'),
          value_cumulee: null,
          day_value: 18.362,
        },
      ],
    });

    // WHEN
    const res = linky_data.compare14joursEntre2ans();

    // THEN
    expect(res.data).toHaveLength(0);
  });
  it('computeDayValueFromCumulee : calcul valeurs jours à partir des cumulés journaliers', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2023-12-07'),
          value_cumulee: 4,
          day_value: null,
        },
        {
          date: new Date('2023-12-08'),
          value_cumulee: 10,
          day_value: null,
        },
        {
          date: new Date('2023-12-09'),
          value_cumulee: 20,
          day_value: null,
        },
        {
          date: new Date('2023-12-10'),
          value_cumulee: 25,
          day_value: null,
        },
      ],
    });

    // WHEN
    linky_data.computeDayValueFromCumulee();

    // THEN
    expect(linky_data.serie).toStrictEqual([
      {
        date: new Date('2023-12-07'),
        value_cumulee: 4,
        day_value: 6,
      },
      {
        date: new Date('2023-12-08'),
        value_cumulee: 10,
        day_value: 6,
      },
      {
        date: new Date('2023-12-09'),
        value_cumulee: 20,
        day_value: 10,
      },
      {
        date: new Date('2023-12-10'),
        value_cumulee: 25,
        day_value: 5,
      },
    ]);
  });

  it('computeDayValueFromCumulee : calcul valeurs jours à partir des cumulés journaliers - cas valeur manquante', () => {
    // GIVEN
    const linky_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date('2023-12-07'),
          value_cumulee: 10,
          day_value: null,
        },
        {
          date: new Date('2023-12-09'),
          value_cumulee: 20,
          day_value: null,
        },
        {
          date: new Date('2023-12-10'),
          value_cumulee: 25,
          day_value: null,
        },
      ],
    });

    // WHEN
    linky_data.computeDayValueFromCumulee();

    // THEN
    expect(linky_data.serie).toStrictEqual([
      {
        date: new Date('2023-12-07'),
        value_cumulee: 10,
        day_value: 10,
      },
      {
        date: new Date('2023-12-09'),
        value_cumulee: 20,
        day_value: 10,
      },
      {
        date: new Date('2023-12-10'),
        value_cumulee: 25,
        day_value: 5,
      },
    ]);
  });
});
