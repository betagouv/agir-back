export class LinkyDataElement {
  time: Date;
  value: number;
  value_at_normal_temperature: number;
  jour?: string;
  semaine?: string;
  mois?: string;
  annee?: string;
}

export class YearMonthLinkyData {
  years: Map<number, MonthLinkyData>;
  constructor() {
    this.years = new Map();
  }
}
export class MonthLinkyData {
  months: Map<number, LinkyDataElement[]>;
  constructor() {
    this.months = new Map();
  }
}
export class DayLinkyData {
  days: Map<number, LinkyDataElement>;
  start_date: Date;
  end_date: Date;
  constructor(startDate: Date, endDate: Date) {
    this.start_date = startDate;
    this.end_date = endDate;
    this.days = new Map();
  }
}
export class LinkyData {
  constructor(data?: LinkyData) {
    if (data) {
      this.prm = data.prm;
      this.serie = data.serie;
      this.serie.forEach((element) => {
        element.time = new Date(element.time);
      });
    } else {
      this.serie = [];
    }
  }
  serie: LinkyDataElement[];
  prm: string;

  public addDataElement?(element: LinkyDataElement) {
    this.serie.push(element);
  }

  public compare2AnsParMois?(): LinkyDataElement[] {
    if (this.serie.length < 2) {
      return [];
    }

    const result = [];

    const last_value = this.getLastDataNotNull();

    const extract = this.extractLastNMonths(24, last_value.time);

    for (let index = 0; index < 12; index++) {
      const mois = extract[index];
      const mois_annee_suivante = extract[index + 12];
      result.push(mois);
      result.push(mois_annee_suivante);
    }
    return result;
  }

  public getLastRoundedValue?(): number {
    if (this.serie.length === 0) return null;
    return Math.round(this.serie[this.serie.length - 1].value * 1000) / 1000;
  }
  public getLastVariation?(): number {
    if (this.serie.length < 2) return null;
    const valN_2 = this.serie[this.serie.length - 2].value;
    const valN_1 = this.serie[this.serie.length - 1].value;
    return Math.floor(((valN_1 - valN_2) / valN_2) * 10000) / 100;
  }

  public extractLastNDays?(nombre: number): LinkyDataElement[] {
    let result = this.serie.slice(-nombre);
    result = result.map((elem) => {
      const new_data: LinkyDataElement = {
        time: elem.time,
        value: elem.value,
        value_at_normal_temperature: elem.value_at_normal_temperature,
        jour: LinkyData.formatJour(elem.time),
      };
      return new_data;
    });
    return result;
  }
  public extractLastNWeeks?(nombre: number): LinkyDataElement[] {
    let result: LinkyDataElement[] = [];
    let extract = this.serie.slice(-nombre * 7);
    for (
      let index_sem = 0;
      index_sem < extract.length;
      index_sem = index_sem + 7
    ) {
      let cumul = 0;
      let cumul_corrigee = 0;
      for (let index = index_sem; index < index_sem + 7; index++) {
        const element = extract[index];
        cumul += element.value;
        cumul_corrigee += element.value_at_normal_temperature;
      }
      result.push({
        time: this.serie[index_sem].time,
        value: cumul,
        value_at_normal_temperature: cumul_corrigee,
      });
    }
    return result;
  }
  public extractLastNMonths?(nombre: number, date: Date): LinkyDataElement[] {
    const result = [];

    const years_months = LinkyData.listMonthsFromDate(nombre, date);

    this.fillRequiredYearMonthsData(years_months);

    this.cumulateMonthData(years_months);

    years_months.years.forEach((year) => {
      year.months.forEach((month) => {
        result.push(month[0]);
      });
    });
    result.reverse();

    return result;
  }

  public cleanData?() {
    this.unduplicateDataSerie();
    this.orderDataSerie();
  }

  static listMonthsFromDate?(
    nombre: number,
    start_date: Date,
  ): YearMonthLinkyData {
    const result = new YearMonthLinkyData();
    let current_date = start_date;

    for (let index = 0; index < nombre; index++) {
      const current_year = current_date.getFullYear();
      if (!result.years.has(current_year)) {
        result.years.set(current_year, new MonthLinkyData());
      }
      const current_month = current_date.getMonth();
      result.years.get(current_year).months.set(current_month, []);
      current_date.setDate(0);
    }
    return result;
  }

  cumulateMonthData?(year_month_data: YearMonthLinkyData) {
    year_month_data.years.forEach((year, key_year) => {
      year.months.forEach((month, key_month) => {
        let cumul = 0;
        let cumul_corrigee = 0;
        month.forEach((element) => {
          cumul += element.value;
          cumul_corrigee += element.value_at_normal_temperature;
        });
        const date_to_set = new Date(key_year, key_month);
        year.months.set(key_month, [
          {
            time: date_to_set,
            value: cumul,
            value_at_normal_temperature: cumul_corrigee,
            mois: LinkyData.formatMois(date_to_set),
            annee: LinkyData.formatAnnee(date_to_set),
          },
        ]);
      });
    });
  }

  fillRequiredYearMonthsData?(year_month_data: YearMonthLinkyData) {
    this.serie.forEach((element) => {
      const current_year = element.time.getFullYear();
      const current_month = element.time.getMonth();
      if (year_month_data.years.get(current_year)) {
        const month_entry = year_month_data.years
          .get(current_year)
          .months.get(current_month);
        if (month_entry) {
          month_entry.push(element);
        }
      }
    });
  }

  public dynamicCompareTwoYears?(): LinkyDataElement[] {
    const last_date = this.getLastDataNotNull();
    if (!last_date) return [];
    const month = this.compareMonthDataTwoYears(last_date.time);
    const week = this.compareWeekDataTwoYears(last_date.time);
    const day = this.compareDayDataTwoYears();
    return [].concat(month, week, day);
  }

  compareDayDataTwoYears?(): LinkyDataElement[] {
    if (this.serie.length < 366) return [];

    const last_element = this.getLastDataNotNull();
    const last_day = new Date(last_element.time);
    const last_day_previous_year = new Date(last_day);
    last_day_previous_year.setFullYear(
      last_day_previous_year.getFullYear() - 1,
    );

    const last_day_last_year_element = this.searchDays(
      last_day_previous_year,
      last_day_previous_year,
    )[0];

    last_element.jour = LinkyData.formatJour(last_element.time);
    last_element.annee = LinkyData.formatAnnee(last_element.time);
    last_day_last_year_element.jour = LinkyData.formatJour(
      last_day_last_year_element.time,
    );
    last_day_last_year_element.annee = LinkyData.formatAnnee(
      last_day_last_year_element.time,
    );
    return [last_day_last_year_element, last_element];
  }
  compareMonthDataTwoYears?(current_date: Date): LinkyDataElement[] {
    if (this.serie.length < 425) return [];
    const previous_month = new Date(current_date);
    previous_month.setMonth(previous_month.getMonth() - 1);

    const previous_month_previous_year = new Date(previous_month);
    previous_month_previous_year.setFullYear(previous_month.getFullYear() - 1);

    const last_month_data = this.extractLastNMonths(1, previous_month);
    const last_year_month_data = this.extractLastNMonths(
      1,
      previous_month_previous_year,
    );
    return last_year_month_data.concat(last_month_data);
  }

  compareWeekDataTwoYears?(current_date: Date): LinkyDataElement[] {
    if (this.serie.length < 380) return [];
    const start_date = LinkyData.getPreviousWeekFirstDay(current_date);
    const end_date = LinkyData.getPreviousWeekLastDay(current_date);
    const currentYearDaysToCumulate = this.searchDays(start_date, end_date);

    const current_year = current_date.getFullYear();

    const previous_year_start_date = new Date(start_date);
    previous_year_start_date.setFullYear(current_year - 1);

    const previous_year_end_date = new Date(end_date);
    previous_year_end_date.setFullYear(current_year - 1);

    const previousYearDaysToCumulate = this.searchDays(
      previous_year_start_date,
      previous_year_end_date,
    );

    let previous_year_cumul = 0;
    let previous_year_cumul_norm = 0;
    let current_year_cumul = 0;
    let current_year_cumul_norm = 0;

    previousYearDaysToCumulate.forEach((element) => {
      previous_year_cumul += element.value;
      previous_year_cumul_norm += element.value_at_normal_temperature;
    });
    currentYearDaysToCumulate.forEach((element) => {
      current_year_cumul += element.value;
      current_year_cumul_norm += element.value_at_normal_temperature;
    });

    const week = LinkyData.getWeek(start_date).toString();
    return [
      {
        time: previous_year_start_date,
        value: previous_year_cumul,
        value_at_normal_temperature: previous_year_cumul_norm,
        semaine: week,
        annee: previous_year_start_date.getFullYear().toString(),
      },
      {
        time: start_date,
        value: current_year_cumul,
        value_at_normal_temperature: current_year_cumul_norm,
        semaine: week,
        annee: start_date.getFullYear().toString(),
      },
    ];
  }

  searchDays?(startDate: Date, endDate: Date): LinkyDataElement[] {
    const dayLinkyData = new DayLinkyData(startDate, endDate);
    this.serie.forEach((element) => {
      if (LinkyData.isBetween(element.time, startDate, endDate)) {
        dayLinkyData.days.set(element.time.getTime(), element);
      }
    });
    return Array.from(dayLinkyData.days.values());
  }

  static isBetween(day: Date, startDate: Date, endDate: Date): boolean {
    const start_time = new Date(startDate).setHours(0, 0, 0, 0);
    const end_time = new Date(endDate).setHours(23, 59, 59, 999);
    const dayTime = day.getTime();
    return start_time <= dayTime && dayTime <= end_time;
  }
  static getPreviousWeekFirstDay(now: Date): Date {
    const day_in_week = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const day = now.getDate() - day_in_week - 7;
    const result = new Date(now.getTime());
    result.setDate(day);
    return result;
  }
  static getPreviousWeekLastDay(now: Date): Date {
    const monday = LinkyData.getPreviousWeekFirstDay(now);
    const result = new Date(now.getTime());
    result.setDate(monday.getDate() + 6);
    return result;
  }
  private orderDataSerie?() {
    this.serie.sort((a, b) => a.time.getTime() - b.time.getTime());
  }
  private unduplicateDataSerie?() {
    const time_map: Map<string, LinkyDataElement> = new Map();

    this.serie.forEach((element) => {
      time_map.set(element.time.toISOString(), element);
    });

    this.serie = Array.from(time_map.values());
  }

  // Returns the ISO week of the date.
  static getWeek?(input: Date) {
    let date = new Date(input.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      )
    );
  }

  private getLastDataNotNull?(): LinkyDataElement {
    for (let index = this.serie.length - 1; index >= 0; index--) {
      const element = this.serie[index];
      if (element.value !== null) {
        return element;
      }
    }
  }
  private static formatJour?(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date);
  }
  private static formatMois?(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date);
  }
  private static formatAnnee?(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(date);
  }

  // Returns the four-digit year corresponding to the ISO week of the date.
  static getWeekYear?(input: Date) {
    let date = new Date(input.getTime());
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    return date.getFullYear();
  }
}
